import { app as electron } from "electron";

import squirrel from "./app/events/squirrel.events";
import electronEvents from "./app/events/electron.events";
import updateEvents from "./app/events/update.events";
import app from "./app/app";

namespace main {
	export function initialize() {
		if (squirrel.handleEvents()) {
			// squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
			electron.quit();
		}
	}

	export function bootstrapApp() {
		app.main();
	}

	export function bootstrapAppEvents() {
		electronEvents.bootstrapElectronEvents();

		// initialize auto updater service
		if (!app.isDevelopmentMode()) {
			updateEvents.initAutoUpdateService();
		}
	}
}

// handle setup events as quickly as possible
main.initialize();

// bootstrap app
main.bootstrapApp();
main.bootstrapAppEvents();
