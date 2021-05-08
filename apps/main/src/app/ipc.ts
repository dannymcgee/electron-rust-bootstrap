import cp from "child_process";
import path from "path";

import { ipcMain } from "electron";

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
			.on("error", onChildErr)

		ipcMain.handle("message", (_, message) => send(message));
	}

	async function send(message: string) {
		return new Promise<string>((resolve, reject) => {
			proc.stdout.once("data", (buf: Buffer) => {
				resolve(buf.toString())
			});
			proc.stdin.write(`${message}\n`, (err) => {
				if (err) reject(err);
			});
		});
	}

	function onChildClose(code: number, signal: NodeJS.Signals|null) {
		console.log("onClose:", { code, signal });
	}

	function onChildExit(code: number|null, signal: NodeJS.Signals|null) {
		console.log("onExit:", { code, signal });
	}

	function onChildErr(err: Error) {
		console.log("onError:", { err });
	}
}

export default ipc;
