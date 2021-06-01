import { MessageType, Response } from "@app/api";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
	getAppVersion: () => ipcRenderer.invoke("get-app-version"),
	send: (type: MessageType, message: string) => {
		return ipcRenderer.invoke("message", {
			type,
			message,
		});
	},
	on: (
		type: MessageType,
		listener: (message:
			| typeof Response.Foo.prototype
			| typeof Response.Bar.prototype
			| typeof Response.Baz.prototype
		) => void,
	) => {
		ipcRenderer.on("message", (_, { msgType, message }) => {
			if (msgType === type) listener(message);
		});
	},
});
