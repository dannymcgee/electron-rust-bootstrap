import cp from "child_process";
import { Readable, Writable } from "stream";

import { Observable, Subject } from "rxjs";
import { filter, first, map, share } from "rxjs/operators";

import {
	MessageType,
	Request,
	RequestMessage,
	Response,
	ResponseMessage,
} from "@app/api";

const VARINT_FLAG = 1 << 7;

class Sender {
	constructor(
		private _stream: Writable
	) {}

	async send(msgType: MessageType, message: RequestMessage<typeof msgType>) {
		let header = Request.Header
			.encode(new Request.Header({ msgType }))
			.finish();
		let request = getRequestType(msgType)
			.encode(message)
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

class Receiver {
	private _stream$: Observable<{
		msgType: MessageType;
		message: ResponseMessage<MessageType>
	}>;

	constructor(proc: cp.ChildProcess, stream: Readable) {
		let subject = new Subject<any>();
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
					case MessageType.Foo: return Response.Foo.decode(buf);
					case MessageType.Bar: return Response.Bar.decode(buf);
					case MessageType.Baz: return Response.Baz.decode(buf);
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

	async recv(msgType: MessageType): Promise<ResponseMessage<typeof msgType>> {
		if (msgType === MessageType.None)
			throw new Error("Invalid message type");

		return this._stream$.pipe(
			filter(msg => msg?.msgType === msgType),
			first(),
			map(msg => msg.message),
		).toPromise();
	}

	recvAll(msgType: MessageType): Observable<ResponseMessage<typeof msgType>> {
		if (msgType === MessageType.None)
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
		case MessageType.Foo: return Request.Foo;
		case MessageType.Bar: return Request.Bar;
		case MessageType.Baz: return Request.Baz;
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
