import { promises as fs } from "fs";
import * as cp from "child_process";
import * as path from "path";
import * as _rimraf from "rimraf";

import { BuilderContext, createBuilder } from "@angular-devkit/architect";

import { Options } from "./schema";
import { Transpiler } from "./transpiler";

export default createBuilder(runBuilder);

async function runBuilder(opts: Options, ctx: BuilderContext) {
	try {
		let { workspaceRoot } = ctx;
		let protosPath = path.resolve(workspaceRoot, opts.protosPath);
		let workspaceJson = await fs
			.readFile(path.join(workspaceRoot, "angular.json"))
			.then(buf => JSON.parse(buf.toString()));
		let srcRoot = workspaceJson?.projects?.[ctx.target.project]?.sourceRoot as string;

		await Promise.all([
			generateTsFiles(protosPath, srcRoot),
			buildRustLib(srcRoot),
		]);
	} catch (err) {
		return {
			success: false,
			error: err.stack,
		};
	}

	return { success: true };
}

async function generateTsFiles(protosPath: string, srcRoot: string) {
	let filenames = (await fs.readdir(protosPath))
		.filter(f => f.endsWith(".proto"));

	let sources = await Promise.all(
		filenames
			.map(f => path.resolve(protosPath, f))
			.map(f => fs.readFile(f).then(buf => buf.toString()))
	);

	let outDir = path.resolve(srcRoot, "lib/ts");
	await Promise.all(sources.map(async (src, idx) => {
		let filename = filenames[idx].replace(/\.proto$/, ".ts");
		let outPath = path.resolve(outDir, filename);
		let transpiled = new Transpiler(src).generate();

		await fs.writeFile(outPath, transpiled);
	}));
}

async function buildRustLib(srcRoot: string) {
	let workingDir = path.resolve(srcRoot, "lib/rust");
	let prevOutput = path.resolve(workingDir, "target");

	await rimraf(prevOutput);

	return new Promise<void>((resolve, reject) => {
		cp.spawn("cargo", ["build"], {
			stdio: "inherit",
			cwd: workingDir,
		})
			.on("close", resolve)
			.on("exit", resolve)
			.on("error", reject);
	});
}

async function rimraf(dir: string) {
	return new Promise<void>((resolve, reject) => {
		_rimraf(dir, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}
