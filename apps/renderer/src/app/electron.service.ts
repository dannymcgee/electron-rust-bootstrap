import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class ElectronService {
	async send(message: string) {
		return electron.send(message);
	}
}
