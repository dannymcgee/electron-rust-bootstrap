import { createComponentFactory, Spectator } from "@ngneat/spectator/jest";

import { AppComponent } from "./app.component";
import { ElectronService } from "./electron.service";

describe("AppComponent", () => {
	let spectator: Spectator<AppComponent>;
	const createComponent = createComponentFactory({
		component: AppComponent,
		mocks: [ElectronService],
	});

	beforeEach(() => {
		spectator = createComponent();
	});

	it("should create the app", () => {
		expect(spectator.component).toExist();
	});
});
