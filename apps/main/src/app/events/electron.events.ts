/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain } from "electron";
import { environment } from "../../environments/environment";

namespace electronEvents {
	export function bootstrapElectronEvents(): Electron.IpcMain {
		// Retrieve app version
		ipcMain.handle("get-app-version", _ => {
			console.log(`Fetching application version... [v${environment.version}]`);

			return environment.version;
		});

		// Handle App termination
		ipcMain.on("quit", (_, code) => {
			app.exit(code);
		});

		return ipcMain;
	}
}

export default electronEvents;
