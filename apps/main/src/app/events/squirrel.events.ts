/**
 * This module is responsible on handling all the setup events that is submitted by squirrel.
 */

import { app as electron } from "electron";
import cp from "child_process";
import path from "path";
import { environment } from "../../environments/environment";

// export default class SquirrelEvents {
namespace squirrelEvents {
	let isAppFirstRun = false;

	// app paths
	let appFolder = path.resolve(process.execPath, "..");
	let appRootFolder = path.resolve(appFolder, "..");
	let updateExe = path.resolve(
		path.join(appRootFolder, "Update.exe")
	);
	let exeName = path.resolve(
		path.join(
			appRootFolder,
			"app-" + environment.version,
			path.basename(process.execPath)
		)
	);

	export function handleEvents(): boolean {
		if (process.argv.length === 1 || process.platform !== "win32")
			return false;

		switch (process.argv[1]) {
			case "--squirrel-install":
			case "--squirrel-updated":
				// Install desktop and start menu shortcuts
				update(["--createShortcut", exeName]);

				return true;

			case "--squirrel-uninstall":
				// Remove desktop and start menu shortcuts
				update(["--removeShortcut", exeName]);

				return true;

			case "--squirrel-obsolete":
				electron.quit();
				return true;

			case "--squirrel-firstrun":
				// Check if it the first run of the software
				isAppFirstRun = true;
				return false;
		}

		return false;
	}

	export function isFirstRun(): boolean {
		return isAppFirstRun;
	}

	function update(args: Array<string>) {
		try {
			cp.spawn(updateExe, args, { detached: true })
				.on("close", () => setTimeout(electron.quit, 1000));
		}
		catch (_) {
			setTimeout(electron.quit, 1000);
		}
	}
}

export default squirrelEvents;
