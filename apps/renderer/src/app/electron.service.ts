import { Injectable } from "@angular/core";

import { Observable, Subject } from "rxjs";
import { filter, first, map, share } from "rxjs/operators";

import { MessageType, RequestMessage, ResponseMessage } from "@app/api";

@Injectable({
	providedIn: "root",
})
export class ElectronService {
	private _message$: Observable<{
		msgType: MessageType;
		message: ResponseMessage<MessageType>,
	}>;

	constructor() {
		let subject = new Subject();
		this._message$ = subject.pipe(share()) as any;

		electron.on(MessageType.Foo, (message) => {
			subject.next({ msgType: MessageType.Foo, message });
		});
		electron.on(MessageType.Bar, (message) => {
			subject.next({ msgType: MessageType.Bar, message });
		});
		electron.on(MessageType.Baz, (message) => {
			subject.next({ msgType: MessageType.Baz, message });
		});
	}

	async send(msgType: MessageType, message: RequestMessage<typeof msgType>) {
		return electron.send(msgType, message);
	}

	recv(msgType: MessageType): Promise<ResponseMessage<typeof msgType>> {
		return this._message$.pipe(
			filter(msg => msg.msgType === msgType),
			first(),
			map(msg => msg.message),
		).toPromise();
	}

	recvAll(msgType: MessageType): Observable<ResponseMessage<typeof msgType>> {
		return this._message$.pipe(
			filter(msg => msg.msgType === msgType),
			map(msg => msg.message),
		);
	}
}
