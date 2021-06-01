import { Component } from "@angular/core";
import { ElectronService } from "./electron.service";

import { MessageType } from "@app/api";

@Component({
	selector: "app-root",
	template: `
		<button (click)="sendMessage(MessageType.FOO)">Send Foo Message</button>
		<button (click)="sendMessage(MessageType.BAR)">Send Bar Message</button>
		<button (click)="sendMessage(MessageType.BAZ)">Send Baz Message</button>
	`,
	styles: [``],
})
export class AppComponent {
	MessageType = MessageType;

	constructor(
		private _electron: ElectronService,
	) {}

	async sendMessage(msgType: MessageType) {
		await this._electron.send(msgType, "Hello, back-end!");
	}
}
