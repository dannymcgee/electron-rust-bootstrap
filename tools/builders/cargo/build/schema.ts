export enum Target {
	/**
	 * Outputs JS that is suitable for interoperation with a Bundler like
	 * Webpack. You'll `import` the JS and the `module` key is specified in
	 * `package.json`. `sideEffects: false` is by default.
	 */
	Bundler = "bundler",
	/**
	 * Outputs JS that uses CommonJS modules, for use with a `require` statement.
	 * `main` key in package.json.
	 */
	NodeJS = "nodejs",
	/**
	 * Outputs JS that can be natively imported as an ES module in a browser, but
	 * the WebAssembly must be manually instantiated and loaded.
	 */
	Web = "web",
	/**
	 * Same as `web`, except the JS is included on a page and modifies global
	 * state, and doesn't support as many `wasm-bindgen` features as `web`
	 */
	NoModules = "no-modules",
}

export enum Profile {
	/** Useful for development and debugging. */
	Dev = "dev",
	/** Useful when profiling and investigating performance issues. */
	Profiling = "profiling",
	/** Useful for shipping to production. */
	Release = "release",
}

export interface Options {
	/**
	 * By default, `wasm-pack` will generate a directory for it's build output
	 * called `pkg`. If you'd like to customize this you can use this flag.
	 */
	outDir?: string;
	/**
	 * Sets the prefix for output file names. If not provided, package name is
	 * used instead.
	 */
	outName?: string;
	/**
	 * This controls whether debug assertions are enabled, debug info is
	 * generated, and which (if any) optimizations are enabled.
	 *
	 * | Profile    | Debug Assertions | Debug Info | Optimizations |
	 * | ---------- | ---------------- | ---------- | ------------- |
	 * | Dev        | Yes              | Yes        | No            |
	 * | Profiling  | No               | Yes        | Yes           |
	 * | Release    | No               | No         | Yes           |
	 *
	 * The `Dev` profile will build the output package using cargo's default
	 * non-release profile. Building this way is faster but applies few
	 * optimizations to the output, and enables debug assertions and other
	 * runtime correctness checks. The `Profiling` and `release` profiles use
	 * cargo's release profile, but the former enables debug info as well, which
	 * helps when investigating performance issues in a profiler.
	 *
	 * The exact meaning of the profile flags may evolve as the platform matures.
	 */
	profile?: Profile;
	/**
	 * This will customize the JS that is emitted and how the WebAssembly files
	 * are instantiated and loaded. For more documentation on the various
	 * strategies here, see the [documentation](https://rustwasm.github.io/docs/wasm-bindgen/reference/deployment.html)
	 * on using the compiled output.
	 */
	target?: Target;
	/** Watch source directory and rebuild on changes. */
	watch?: boolean;
}
