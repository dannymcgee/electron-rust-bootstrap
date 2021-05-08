import { app as electron, autoUpdater, dialog } from "electron";
import { platform, arch } from "os";
import { UPDATE_SERVER_URL } from "../constants";
import app from "../app";

// export default class UpdateEvents {
namespace updateEvents {
	// initialize auto update service - most be invoked only in production
	export function initAutoUpdateService() {
		const platform_arch =
			platform() === "win32" ? platform() : platform() + "_" + arch();
		const version = electron.getVersion();
		const feed: Electron.FeedURLOptions = {
			url: `${UPDATE_SERVER_URL}/update/${platform_arch}/${version}`,
		};

		if (!app.isDevelopmentMode()) {
			console.log("Initializing auto update service...\n");

			autoUpdater.setFeedURL(feed);
			checkForUpdates();
		}
	}

	// check for updates - most be invoked after initAutoUpdateService() and only in production
	export function checkForUpdates() {
		if (!app.isDevelopmentMode() && autoUpdater.getFeedURL() !== "") {
			autoUpdater.checkForUpdates();
		}
	}
}

autoUpdater.on(
	"update-downloaded",
	(event, releaseNotes, releaseName, releaseDate) => {
		const dialogOpts = {
			type: "info",
			buttons: ["Restart", "Later"],
			title: "Application Update",
			message: process.platform === "win32" ? releaseNotes : releaseName,
			detail:
				"A new version has been downloaded. Restart the application to apply the updates.",
		};

		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			if (returnValue.response === 0) autoUpdater.quitAndInstall();
		});
	}
);

autoUpdater.on("checking-for-update", () => {
	console.log("Checking for updates...\n");
});

autoUpdater.on("update-available", () => {
	console.log("New update available!\n");
});

autoUpdater.on("update-not-available", () => {
	console.log("Up to date!\n");
});

autoUpdater.on("before-quit-for-update", () => {
	console.log("Application update is about to begin...\n");
});

autoUpdater.on("error", (message) => {
	console.error("There was a problem updating the application");
	console.error(message, "\n");
});

export default updateEvents;
