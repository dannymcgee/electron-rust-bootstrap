import cp from "child_process";
import path from "path";

import { ipcMain } from "electron";
import { load, Reader } from "protobufjs";

const BACKEND_EXE_PATH = "apps/back-end/target/debug/back-end.exe";
const PROTO_PATH = "apps/main/src/app/hello-world.proto";

const HelloWorldAsync = (async () => {
	let proto = path.resolve(process.cwd(), PROTO_PATH);
	let root = await load(proto);

	return root.lookupType("HelloWorld");
})();


namespace ipc {
	let proc: cp.ChildProcess;

	export function init() {
		let exe = path.resolve(process.cwd(), BACKEND_EXE_PATH);
		proc = cp.spawn(exe, {
			stdio: [
				"pipe",
				"pipe",
				process.stderr,
			]
		})
			.on("close", onChildClose)
			.on("exit", onChildExit)
			.on("error", onError)

		ipcMain.handle("message", (_, message) => send(message));
	}

	async function send(message: string) {
		let start = Date.now();
		let HelloWorld = await HelloWorldAsync;
		let msg = HelloWorld.create({ value: message });
		let reqBuf = HelloWorld.encode(msg).finish();

		proc.stdout.once("data", (buf) => {
			let reader = Reader.create(buf);
			let res = HelloWorld.decodeDelimited(reader);
			let end = Date.now();

			console.log("from back-end:", res);
			console.log(`Roundtrip cost: ${end - start}ms`);
		});

		proc.stdin.write(reqBuf, (err) => {
			if (err) onError(err);
			else proc.stdin.write("\r", (err) => {
				if (err) onError(err);
			});
		});
	}

	function onChildClose(code: number, signal: NodeJS.Signals|null) {
		console.log("onClose:", { code, signal });
	}

	function onChildExit(code: number|null, signal: NodeJS.Signals|null) {
		console.log("onExit:", { code, signal });
	}

	function onError(err: Error) {
		console.log("onError:", { err });
	}
}

export default ipc;
