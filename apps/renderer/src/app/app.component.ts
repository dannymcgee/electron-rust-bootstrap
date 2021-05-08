import { Component } from "@angular/core";

@Component({
	selector: "daw-root",
	template: `
		<button (click)="hello()">Say Hello</button>
	`,
	styles: [``],
})
export class AppComponent {
	hello() {
	}
}
