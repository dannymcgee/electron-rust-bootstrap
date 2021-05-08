import { app as electron, BrowserWindow, shell, screen } from "electron";
import path from "path";
import url from "url";

import { environment } from "../environments/environment";
import { RENDERER_NAME, RENDERER_PORT } from "./constants";
import ipc from "./ipc";

namespace app {
	let mainWindow: BrowserWindow;

	export function main() {
		ipc.init();

		electron.on("window-all-closed", onWindowAllClosed); // Quit when all windows are closed.
		electron.on("ready", onReady); // App is ready to load data
		electron.on("activate", onActivate); // App is activated
	}

	export function isDevelopmentMode() {
		const isEnvironmentSet = "ELECTRON_IS_DEV" in process.env;
		const getFromEnvironment = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

		return isEnvironmentSet ? getFromEnvironment : !environment.production;
	}

	function onWindowAllClosed() {
		if (process.platform !== "darwin")
			electron.quit();
	}

	function onClose() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	}

	function onRedirect(event: Event, url: string) {
		if (url !== mainWindow.webContents.getURL()) {
			// this is a normal external redirect, open it in a new browser window
			event.preventDefault();
			shell.openExternal(url);
		}
	}

	function onReady() {
		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs.
		initMainWindow();
		loadMainWindow();
	}

	function onActivate() {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (!mainWindow) onReady();
	}

	function initMainWindow() {
		const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
		const width = Math.min(1280, workAreaSize.width || 1280);
		const height = Math.min(720, workAreaSize.height || 720);

		// Create the browser window.
		mainWindow = new BrowserWindow({
			width: width,
			height: height,
			show: false,
			webPreferences: {
				contextIsolation: true,
				backgroundThrottling: false,
				preload: path.join(__dirname, "preload.js"),
			},
		});
		mainWindow.setMenu(null);
		mainWindow.center();

		// if main window is ready to show, close the splash window and show the main window
		mainWindow.once("ready-to-show", () => {
			mainWindow.show();
			mainWindow.webContents.openDevTools();
		});

		// handle all external redirects in a new browser window
		// App.mainWindow.webContents.on('will-navigate', App.onRedirect);
		// App.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
		//     App.onRedirect(event, url);
		// });

		// Emitted when the window is closed.
		mainWindow.on("closed", () => {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null;
		});
	}

	function loadMainWindow() {
		// load the index.html of the app.
		if (!electron.isPackaged) {
			console.log(`Loading URL: http://localhost:${RENDERER_PORT}`);
			mainWindow.loadURL(`http://localhost:${RENDERER_PORT}`);
		} else {
			console.log(`Loading URL: ${url.format({
				pathname: path.join(__dirname, "..", RENDERER_NAME, "index.html"),
				protocol: "file:",
				slashes: true,
			})}`);
			mainWindow.loadURL(
				url.format({
					pathname: path.join(__dirname, "..", RENDERER_NAME, "index.html"),
					protocol: "file:",
					slashes: true,
				})
			);
		}
	}
}

export default app;
