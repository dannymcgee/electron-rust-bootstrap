import { Component, OnInit } from "@angular/core";

import { MessageType } from "@app/api";
import { ElectronService } from "./electron.service";

@Component({
	selector: "app-root",
	template: `
		<button (click)="sendMessage(MessageType.FOO)">Send Foo Message</button>
		<button (click)="sendMessage(MessageType.BAR)">Send Bar Message</button>
		<button (click)="sendMessage(MessageType.BAZ)">Send Baz Message</button>
	`,
	styles: [``],
})
export class AppComponent implements OnInit {
	MessageType = MessageType;

	constructor(
		private _electron: ElectronService,
	) {}

	ngOnInit(): void {
		this._electron
			.recvAll(MessageType.FOO)
			.subscribe(console.log);
	}

	async sendMessage(msgType: MessageType) {
		await this._electron.send(msgType, "Hello, back-end!");
	}
}
