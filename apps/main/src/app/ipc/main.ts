import path from "path";

import { ipcMain } from "electron";

import { MessageType, Response } from "@app/api";
import { pipe } from "./pipe";
import app from "../app";

const BACKEND_EXE_PATH = "apps/back-end/target/debug/back-end.exe";

export function init() {
	let exe = path.resolve(process.cwd(), BACKEND_EXE_PATH);
	let [tx, rx] = pipe(exe);

	ipcMain.handle("message", (_, { type, message }) => {
		tx.send(type, message);
	});

	rx.recvAll(MessageType.FOO)
		.subscribe(message => {
			sendToRenderer(MessageType.FOO, message);
		});

	rx.recvAll(MessageType.BAR)
		.subscribe(message => {
			sendToRenderer(MessageType.BAR, message);
		});

	rx.recvAll(MessageType.BAZ)
		.subscribe(message => {
			sendToRenderer(MessageType.BAZ, message);
		});
}

function sendToRenderer(
	msgType: MessageType,
	message:
		| typeof Response.Foo.prototype
		| typeof Response.Bar.prototype
		| typeof Response.Baz.prototype
) {
	app.getMainWindow()
		.webContents
		.send("message", { msgType, message });
}
