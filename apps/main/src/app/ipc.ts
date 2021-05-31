import cp from "child_process";
import path from "path";

import { ipcMain } from "electron";
import { Reader } from "protobufjs";

import { api } from "@app/api";

const BACKEND_EXE_PATH = "apps/back-end/target/debug/back-end.exe";

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

		let req = new api.Request({
			type: api.MessageType.FOO,
			payload: "foo",
			foo: new api.Request.FooPayload({
				foo: message,
			}),
		});
		let reqBuf = api.Request.encode(req).finish();

		proc.stdout.once("data", (buf) => {
			let reader = Reader.create(buf);
			let res = api.Response.decode(reader);
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
