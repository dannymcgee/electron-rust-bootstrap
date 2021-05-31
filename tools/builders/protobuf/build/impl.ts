import { promises as fs } from "fs";
import * as path from "path";

import { BuilderContext, createBuilder } from "@angular-devkit/architect";

import { Options } from "./schema";
import { Transpiler } from "./transpiler";

export default createBuilder(runBuilder);

async function runBuilder(opts: Options, ctx: BuilderContext) {
	let { workspaceRoot } = ctx;
	let protosPath = path.resolve(workspaceRoot, opts.protosPath);
	let workspaceJson = await fs
		.readFile(path.join(workspaceRoot, "angular.json"))
		.then(buf => JSON.parse(buf.toString()));

	let srcRoot = workspaceJson?.projects?.[ctx.target.project]?.sourceRoot as string;

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

	return { success: true };
}
