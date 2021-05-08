import "jest-preset-angular";

Object.defineProperty(window, "electron", {
	value: {
		getAppVersion: async () => "",
		send: async (_: string) => "",
		platform: "Jest",
	}
})
