import { Injectable } from "@angular/core";
import { MessageType } from "@app/api";

@Injectable({
	providedIn: "root",
})
export class ElectronService {
	async send(msgType: MessageType, message: string) {
		return electron.send(msgType, message);
	}
}
