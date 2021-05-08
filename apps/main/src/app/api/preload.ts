import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
	getAppVersion: () => ipcRenderer.invoke("get-app-version"),
	send: (message: string) => ipcRenderer.invoke("message", message),
});
