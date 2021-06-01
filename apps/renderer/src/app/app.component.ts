import { Component, OnInit } from "@angular/core";

import { MessageType } from "@app/api";
import { ElectronService } from "./electron.service";

@Component({
	selector: "app-root",
	template: `
		<button (click)="sendMessage(MessageType.Foo)">Send Foo Message</button>
		<button (click)="sendMessage(MessageType.Bar)">Send Bar Message</button>
		<button (click)="sendMessage(MessageType.Baz)">Send Baz Message</button>
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
			.recvAll(MessageType.Foo)
			.subscribe(console.log);
	}

	async sendMessage(msgType: MessageType) {
		let key = ((msgType) => {
			switch (msgType) {
			case MessageType.Foo: return "foo";
			case MessageType.Bar: return "bar";
			case MessageType.Baz: return "baz";
			}
		})(msgType);

		await this._electron.send(msgType, {
			[key]: "Hello, back-end!"
		} as any);
	}
}
