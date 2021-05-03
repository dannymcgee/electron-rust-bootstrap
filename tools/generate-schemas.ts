import * as fs from "fs";
import * as Path from "path";

import * as TJS from "typescript-json-schema";

(function() {
	let done = false;

	main(() => {
		done = true;
	});

	const check = () => {
		if (!done) setTimeout(check);
		else return;
	}
})();

function main(done: () => void) {
	const toolsDir = Path.resolve(process.cwd(), "tools");

	walk(toolsDir, (schemas) => {
		let pending = schemas.length;

		schemas.forEach(async (schema) => {
			try {
				await parse(schema);
			} catch (err) {
				console.error(err);
				process.exit(1);
			}
			if (!--pending) done();
		});
	});
}

function parse(schemaPath: string) {
	return new Promise<void>((resolve, reject) => {
		const program = TJS.getProgramFromFiles([schemaPath]);
		const schema = TJS.generateSchema(program, "Options");
		const content = JSON.stringify(schema, null, "\t");
		const path = schemaPath.replace(/\.ts$/, ".json");

		fs.writeFile(path, content, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
}

function walk(dir: string, done: (schemaFiles: string[]) => void): void {
	const results: string[] = [];

	fs.readdir(dir, (err, list) => {
		if (err) throw err;

		let pending = list.length;
		if (!pending) return done(results);

		list.forEach((path) => {
			path = Path.resolve(dir, path);

			fs.stat(path, (err, stat) => {
				if (err) throw err;

				const segments = path.split(/[\/\\]/);
				if (segments[segments.length - 1] === "schema.ts") {
					results.push(path);
					if (!--pending) done(results);
				}
				else if (stat?.isDirectory()) {
					walk(path, (res) => {
						results.push(...res);

						if (!--pending) done(results);
					});
				}
				else {
					if (!--pending) done(results);
				}
			});
		});
	});
}
