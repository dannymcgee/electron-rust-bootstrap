import { Component } from "@angular/core";
import { ElectronService } from "./electron.service";

@Component({
	selector: "app-root",
	template: `
		<button (click)="hello()">Say Hello</button>
	`,
	styles: [``],
})
export class AppComponent {
	constructor(
		private _electron: ElectronService,
	) {}

	async hello() {
		await this._electron.send("Hello, back-end!");
	}
}
