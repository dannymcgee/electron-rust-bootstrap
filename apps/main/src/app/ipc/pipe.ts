import cp from "child_process";
import { Readable, Writable } from "stream";

import { Observable, Subject } from "rxjs";
import { filter, first, map, share } from "rxjs/operators";

import { MessageType, Request, Response } from "@app/api";

const VARINT_FLAG = 1 << 7;

class Sender {
	constructor(
		private _stream: Writable
	) {}

	send(msgType: MessageType.FOO, data: typeof Request.Foo.prototype): Promise<void>;
	send(msgType: MessageType.BAR, data: typeof Request.Bar.prototype): Promise<void>;
	send(msgType: MessageType.BAZ, data: typeof Request.Baz.prototype): Promise<void>;

	async send(msgType: MessageType, data: any) {
		let header = Request.Header
			.encode(new Request.Header({ msgType }))
			.finish();
		let request = getRequestType(msgType)
			.encode(makeRequest(msgType, data))
			.finish();

		await this._write(header).catch(onError);
		await this._write(request).catch(onError);
	}

	private _write(buf: Uint8Array) {
		return new Promise<void>((resolve, reject) => {
			this._stream.write(buf, (err) => {
				if (err) reject(err);
				else this._stream.write("\r", (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		});
	}
}

interface AnyResponse {
	msgType: MessageType;
	message:
		| typeof Response.Foo.prototype
		| typeof Response.Bar.prototype
		| typeof Response.Baz.prototype
}

class Receiver {
	private _stream$: Observable<AnyResponse>;

	constructor(proc: cp.ChildProcess, stream: Readable) {
		let subject = new Subject<AnyResponse>();
		this._stream$ = subject.pipe(share());

		proc.on("close", () => subject.complete());
		proc.on("exit", () => subject.complete());
		stream.on("done", () => subject.complete());

		stream.on("readable", async () => {
			try {
				let buf = await this._readBuffer(stream);
				let header = Response.Header.decode(buf);

				buf = await this._readBuffer(stream);
				let response = ((msgType) => {
					switch (msgType) {
					case MessageType.FOO: return Response.Foo.decode(buf);
					case MessageType.BAR: return Response.Bar.decode(buf);
					case MessageType.BAZ: return Response.Baz.decode(buf);
					}
				})(header.msgType);

				if (!response) return;

				subject.next({
					msgType: header.msgType,
					message: response,
				});
			}
			catch (err) {
				console.warn(err.message);
			}
		});
	}

	recv(msgType: MessageType.FOO): Promise<typeof Response.Foo.prototype>;
	recv(msgType: MessageType.BAR): Promise<typeof Response.Bar.prototype>;
	recv(msgType: MessageType.BAZ): Promise<typeof Response.Baz.prototype>;
	recv(msgType: MessageType.NONE): never;

	async recv(msgType: MessageType) {
		if (msgType === MessageType.NONE)
			throw new Error("Invalid message type");

		return this._stream$.pipe(
			filter(msg => msg?.msgType === msgType),
			first(),
			map(msg => msg.message),
		).toPromise();
	}

	recvAll(msgType: MessageType.FOO): Observable<typeof Response.Foo.prototype>;
	recvAll(msgType: MessageType.BAR): Observable<typeof Response.Bar.prototype>;
	recvAll(msgType: MessageType.BAZ): Observable<typeof Response.Baz.prototype>;
	recvAll(msgType: MessageType.NONE): never;

	recvAll(msgType: MessageType) {
		if (msgType === MessageType.NONE)
			throw new Error("Invalid message type");

		return this._stream$.pipe(
			filter(msg => msg?.msgType === msgType),
			map(msg => msg.message),
		);
	}

	private _readBuffer(stream: Readable) {
		return new Promise<Uint8Array>((resolve, reject) => {
			let lenBuf: number[] = [];
			while (true) {
				let byte = stream.read(1)?.[0];
				if (byte == null)
					return reject(new Error("Unexpected end of stream"));

				lenBuf.push(byte);

				if (!(byte & VARINT_FLAG)) break;
			}

			let msgLen = readVarint(lenBuf);
			if (!msgLen)
				return reject(new Error("Expected message length delimiter"));

			resolve(stream.read(msgLen));
		});
	}
}

export function pipe(exePath: string): [Sender, Receiver] {
	let proc = cp.spawn(exePath, {
		stdio: [
			"pipe",
			"pipe",
			process.stderr,
		],
	})
		.on("error", onError);

	let receiver = new Receiver(proc, proc.stdout);
	let sender = new Sender(proc.stdin);

	return [sender, receiver];
}

function onError(err: Error) {
	console.log("onError:", { err });
}

function getRequestType(type: MessageType) {
	switch (type) {
		case MessageType.FOO: return Request.Foo;
		case MessageType.BAR: return Request.Bar;
		case MessageType.BAZ: return Request.Baz;
	}
}

function makeRequest(type: MessageType, message: string) {
	switch (type) {
		case MessageType.FOO:
			return new Request.Foo({
				foo: message,
			});

		case MessageType.BAR:
			return new Request.Bar({
				bar: message,
			});

		case MessageType.BAZ:
			return new Request.Baz({
				baz: message,
			});
	}
}

/**
 * https://developers.google.com/protocol-buffers/docs/encoding#varints
 */
function readVarint(bytes: number[]): number {
	// The conversion as Google explains it boils down to these steps:
	//   1. Reverse the array
	//   2. Drop the first bit from each byte
	//   3. Concatenate the remaining bits into one integer
	//
	// What that actually looks like in practice is a little different...
	return bytes.reduce((acc, byte, idx) => {
		// (2a) Clear the first bit
		byte &= ~VARINT_FLAG;
		// (3)  "Concatenate" with a left-shift and add for each byte
		// (2b) Drop the first bit by shifting 7 per index instead of 8
		// (1)  Since the left-shift amount is increasing for each index,
		//      we're reversing the order of the bytes while we're at it
		return acc + (byte << (7 * idx));
	}, 0);
}

namespace fmt {

export function bin(byte: number): string {
	let result = byte.toString(2);

	if (result.length % 8 > 0) {
		let len = (Math.floor(result.length / 8) + 1) * 8;
		result = result.padStart(len, "0");
	}

	let arr: string[] = [];
	for (let i = 0; (i + 4) <= result.length; i += 4) {
		arr.push(result.substring(i, i + 4));
	}

	return arr.join(" ");
}

export function bits(bytes: number[]): string {
	return "<Bits "
		+ bytes.reduce((acc, cur) => (acc + bin(cur) + " "), "").trim()
		+ " >";
}

export function hex(byte: number): string {
	return byte
		.toString(16)
		.padStart(2, "0")
		.toUpperCase();
}

export function bytes(arr: number[]): string {
	return "<Bytes "
		+ arr.reduce((acc, cur) => (acc + hex(cur) + " "), "").trim()
		+ " >";
}

}

function sleep(ms: number = 0) {
	return new Promise<void>(resolve => {
		setTimeout(resolve, ms);
	});
}
