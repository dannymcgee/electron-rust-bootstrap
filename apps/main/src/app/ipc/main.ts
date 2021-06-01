import path from "path";

import { ipcMain } from "electron";
import { merge } from "rxjs";

import { MessageType } from "@app/api";
import { pipe } from "./pipe";

const BACKEND_EXE_PATH = "apps/back-end/target/debug/back-end.exe";

export function init() {
	let exe = path.resolve(process.cwd(), BACKEND_EXE_PATH);
	let [tx, rx] = pipe(exe);

	ipcMain.handle("message", (_, { type, message }) => {
		tx.send(type, message);
	});

	merge(
		rx.recvAll(MessageType.FOO),
		rx.recvAll(MessageType.BAR),
		rx.recvAll(MessageType.BAZ)
	)
		.subscribe(console.log);
}
