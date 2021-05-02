import { Component } from "@angular/core";
const hello = import("@daw/hello-wasm")

@Component({
	selector: "daw-root",
	template: `
		<button (click)="helloWasm()">Say Hello</button>
	`,
	styles: [``],
})
export class AppComponent {
	async helloWasm() {
		(await hello).greet();
	}
}
