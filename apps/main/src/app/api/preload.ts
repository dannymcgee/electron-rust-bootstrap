import { MessageType, ResponseMessage } from "@app/api";
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
		listener: (message: ResponseMessage<typeof type>) => void,
	) => {
		ipcRenderer.on("message", (_, { msgType, message }) => {
			if (msgType === type) listener(message);
		});
	},
});
