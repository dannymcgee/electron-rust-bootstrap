import * as cp from "child_process";
import { promises as fs } from "fs";
import * as Path from "path";

import {
	BuilderContext,
	BuilderOutput,
	createBuilder,
} from "@angular-devkit/architect";
import * as chalk from "chalk";

import { Options as CLIOptions } from "./schema";

interface Options extends CLIOptions {
	path: string;
}

export default createBuilder(runBuilder);

async function runBuilder(
	opts: CLIOptions,
	ctx: BuilderContext,
): Promise<BuilderOutput> {
	loadEnvVars();

	return normalizeOptions(opts, ctx)
		.then((options) => new Promise<BuilderOutput>((resolve) => {
			cp.spawn("wasm-pack", args(options), { stdio: "inherit" })
				.on("close", () => resolve({ success: true }))
				.on("exit", () => resolve({ success: true }))
				.on("error", (err) => { throw err; });
		}))
		.catch((err) => {
			console.log(chalk.bold.redBright(err.message));
			return { success: false };
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

function args(options: Options): string[] {
	let result = ["build", options.path];

	if (options.profile) result.push(`--${options.profile}`);
	if (options.outDir) result.push("--out-dir", options.outDir);
	if (options.outName) result.push("--out-name", options.outName);
	if (options.target) result.push("--target", options.target);

	return result;
}

function loadEnvVars() {
	try {
		require('dotenv').config();
	} catch (e) {}
}
