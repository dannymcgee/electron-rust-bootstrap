import { Injectable } from "@angular/core";

import { Observable, Subject } from "rxjs";
import { filter, first, map, share } from "rxjs/operators";

import { MessageType, Response } from "@app/api";

@Injectable({
	providedIn: "root",
})
export class ElectronService {
	private _message$: Observable<{
		msgType: MessageType;
		message:
			| typeof Response.Foo.prototype
			| typeof Response.Bar.prototype
			| typeof Response.Baz.prototype
	}>;

	constructor() {
		let subject = new Subject();
		this._message$ = subject.pipe(share()) as any;

		electron.on(MessageType.FOO, (message) => {
			subject.next({ msgType: MessageType.FOO, message });
		});
		electron.on(MessageType.BAR, (message) => {
			subject.next({ msgType: MessageType.BAR, message });
		});
		electron.on(MessageType.BAZ, (message) => {
			subject.next({ msgType: MessageType.BAZ, message });
		});
	}

	async send(msgType: MessageType, message: string) {
		return electron.send(msgType, message);
	}

	recv(msgType: MessageType) {
		return this._message$.pipe(
			filter(msg => msg.msgType === msgType),
			first(),
			map(msg => msg.message),
		).toPromise();
	}

	recvAll(msgType: MessageType) {
		return this._message$.pipe(
			filter(msg => msg.msgType === msgType),
			map(msg => msg.message),
		);
	}
}
