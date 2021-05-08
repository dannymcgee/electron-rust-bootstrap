import * as cp from "child_process";
import { promises as fs, Stats } from "fs";
import * as Path from "path";
import * as chalk from "chalk";
import * as chokidar from "chokidar";

import {
	BuilderContext,
	BuilderOutput,
	createBuilder,
} from "@angular-devkit/architect";
import { from, Observable } from "rxjs";
import { debounceTime, filter, switchMap } from "rxjs/operators";

import { Options as CLIOptions } from "./schema";

interface Options extends CLIOptions {
	path: string;
}

export default createBuilder(runBuilder);

function runBuilder(opts: CLIOptions, ctx: BuilderContext) {
	loadEnvVars();

	return new Promise<BuilderOutput>(async (resolve) => {
		const success = () => resolve({ success: true });
		const error = (err: Error) => {
			console.log(chalk.bold.redBright(err.message));
			resolve({ success: false });
		};

		let options = (await normalizeOptions(opts, ctx).catch(error)) as Options;

		// Watch src directory and re-build on changes
		if (options.watch) {
			// TODO: Duplication
			const { workspaceRoot } = ctx;
			let workspaceJson = await fs
				.readFile(Path.join(workspaceRoot, "angular.json"))
				.then((buffer) => JSON.parse(buffer.toString()));

			let srcRoot = workspaceJson?.projects?.[ctx.target.project]?.sourceRoot;
			if (!srcRoot) error(new Error("No sourceRoot!"));

			await buildLib(options).catch(error);
			console.log("Build completed. Watching for changes...");

			fromChokidar(srcRoot)
				.pipe(
					debounceTime(100),
					filter(e => e.name === "change"),
					filter(e => e.path.endsWith(".rs")),
					switchMap(() => from(buildLib(options))),
				)
				.subscribe({
					next: () => {
						console.log("Build completed. Watching for changes...");
					},
					complete: success,
					error,
				});
		}

		// Build once and resolve
		else {
			buildLib(options)
				.then(success)
				.catch(error);
		}
	});
}

function buildLib(options: Options) {
	return new Promise<void>((resolve, reject) => {
		cp.spawn("cargo", args(options), {
			stdio: "inherit",
			cwd: options.path,
		})
			.on("close", resolve)
			.on("exit", resolve)
			.on("error", reject);
	});
}

async function normalizeOptions(
	cliOptions: CLIOptions,
	ctx: BuilderContext,
): Promise<Options> {
	const { workspaceRoot } = ctx;

	let options = {} as Options;
	let workspaceJson = await fs
		.readFile(Path.join(workspaceRoot, "angular.json"))
		.then((buffer) => JSON.parse(buffer.toString()));

	let project = workspaceJson?.projects?.[ctx.target.project];
	if (project) {
		let projectPath = Path.join(workspaceRoot, project.root);
		let path = Path.relative(process.cwd(), projectPath);

		options.path = path;
	} else {
		throw new Error(`Couldn't find project "${ctx.target.project}"`);
	}

	let target = project?.architect?.[ctx.target.target];
	let targetOptions = target?.options;
	let configuration = target?.configurations?.[ctx.target.configuration];

	if (targetOptions) options = {
		...options,
		...targetOptions,
	};
	if (configuration) options = {
		...options,
		...configuration,
	};
	options = {
		...options,
		...cliOptions,
	}

	return options;
}

function args(_: Options): string[] {
	return ["build"];
}

function loadEnvVars() {
	try {
		require('dotenv').config();
	} catch (_) {}
}

interface ChokidarEvent {
	name: "add"|"addDir"|"change"|"unlink"|"unlinkDir";
	path: string;
	stats?: Stats;
}

function fromChokidar(path: string) {
	return new Observable<ChokidarEvent>((subscriber) => {
		let watcher = chokidar.watch(path);

		watcher.on("error", (err) => {
			subscriber.error(err);
		});

		watcher.on("all", (name, path, stats) => {
			subscriber.next({ name, path, stats });
		});

		return () => {
			watcher.close();
		}
	});
}
