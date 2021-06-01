import { MessageType } from "@app/api";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
	getAppVersion: () => ipcRenderer.invoke("get-app-version"),
	send: (type: MessageType, message: string) => {
		return ipcRenderer.invoke("message", {
			type,
			message,
		});
	},
});
