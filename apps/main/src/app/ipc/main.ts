import path from "path";

import { ipcMain } from "electron";

import { MessageType, ResponseMessage } from "@app/api";
import { pipe } from "./pipe";
import app from "../app";

const BACKEND_EXE_PATH = "apps/back-end/target/debug/back-end.exe";

export function init() {
	let exe = path.resolve(process.cwd(), BACKEND_EXE_PATH);
	let [tx, rx] = pipe(exe);

	ipcMain.handle("message", (_, { type, message }) => {
		tx.send(type, message);
	});

	rx.recvAll(MessageType.Foo)
		.subscribe(message => {
			console.log(message);
			sendToRenderer(MessageType.Foo, message);
		});

	rx.recvAll(MessageType.Bar)
		.subscribe(message => {
			console.log(message);
			sendToRenderer(MessageType.Bar, message);
		});

	rx.recvAll(MessageType.Baz)
		.subscribe(message => {
			console.log(message);
			sendToRenderer(MessageType.Baz, message);
		});
}

function sendToRenderer(
	msgType: MessageType,
	message: ResponseMessage<typeof msgType>,
) {
	app.getMainWindow()
		.webContents
		.send("message", { msgType, message });
}
