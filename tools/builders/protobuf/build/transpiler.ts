import {
	Enum,
	Field,
	NamespaceBase,
	OneOf,
	parse,
	ReflectionObject,
	Type,
} from "protobufjs";

interface TsReflectionObject {
	name: string;
	proto: ReflectionObject;
	parent?: ReflectionObject;
}

interface TsEnum extends TsReflectionObject {
	values: Map<string, number>;
}

interface TsType extends TsReflectionObject {
	fields: TsField[];
	oneOfs: TsOneOf[];
}

interface TsField extends TsReflectionObject {
	id: number;
	type: {
		annotationName: string;
		decoratorName: string;
	};
}

interface TsOneOf extends TsReflectionObject {
	fieldNames: string[];
}

export class Transpiler {
	private _nspace?: string;
	private _imports = new Map<string, Set<string>>();
	private _enums: TsEnum[] = [];
	private _types: TsType[] = [];

	constructor(src: string) {
		let parsed = parse(src);
		let root: NamespaceBase;

		if (parsed.package) {
			this._nspace = parsed.package;
			root = parsed.root.nested[parsed.package] as NamespaceBase;
		} else {
			root = parsed.root;
		}

		root.nestedArray.forEach(it => this.parse(it));
	}

	generate(): string {
		let result: string[] = [];
		let depth = 0;
		let addLines = (...lines: string[]) => {
			let indent = "\t".repeat(depth);

			lines.forEach(line => {
				result.push(indent + line);
			});
		};

		this._imports.forEach((targets, source) => {
			let stmt = `import { `;
			stmt += Array.from(targets)
				.sort((a, b) => a.localeCompare(b))
				.join(", ");
			stmt += ` } from "${source}";`;

			addLines(stmt);
		});

		if (this._imports.size) addLines("");
		if (this._nspace) {
			addLines(
				`export namespace ${this._nspace} {`,
				``,
			);
			depth++;
		}

		this._enums.forEach(it => {
			addLines(`export enum ${it.name} {`);
			depth++;

			it.values.forEach((value, key) => {
				addLines(`${key} = ${value},`);
			});

			depth--;
			addLines("}", "");
		});

		this._types.forEach(it => {
			let exportStmt: string;
			let name: string;

			if (it.parent && it.parent instanceof Type) {
				exportStmt = "";
				name = `${it.parent.name}_${it.name}`;
			} else {
				exportStmt = "export ";
				name = it.name;
			}

			addLines(
				`@Type.d("${name}")`,
				`${exportStmt}class ${name} extends Message<${name}> {`,
			);
			depth++;

			let children = this._types.filter(t => t.parent === it.proto);
			if (children.length) {
				children.forEach(child => {
					addLines(`static ${child.name} = ${name}_${child.name};`);
				});
				addLines("");
			}

			it.fields.forEach(f => {
				addLines(
					`@Field.d(${f.id}, ${f.type.decoratorName}) ${f.name}: ${f.type.annotationName};`
				);
			});
			if (it.fields.length) addLines("");

			it.oneOfs.forEach(o => {
				addLines(
					`@OneOf.d(${o.fieldNames.map(n => `"${n}"`).join(", ")})`,
					`${o.name}: string;`,
					``,
				);
			});

			depth--;
			addLines("}", "");
		});

		if (this._nspace) {
			depth--;
			addLines("}", "");
		}

		return result.reduce((acc, line, idx) => {
			if (result[idx + 1]?.endsWith("}") && !line.trim())
				return acc;

			acc += line.replace(/\s+$/, "");
			if (idx < (result.length - 1))
				acc += "\n";

			return acc;
		}, "");
	}

	private parse(it: ReflectionObject, parent?: ReflectionObject): void {
		if (it instanceof Enum) {
			this.parseEnum(it, parent);
		}
		else if (it instanceof Type) {
			this.parseType(it, parent);
		}
	}

	private parseEnum(it: Enum, parent?: ReflectionObject): void {
		let values = new Map<string, number>();

		Object.entries(it.values)
			.forEach(([key, value]) => {
				values.set(key, value);
			});

		this._enums.push({
			name: it.name,
			proto: it,
			parent,
			values,
		});
	}

	private parseType(it: Type, parent?: ReflectionObject): void {
		this.addImport("protobufjs", ["Message", "Type"]);

		it.nestedArray.forEach(nested => this.parse(nested, it));

		let fields = it.fieldsArray.map(f => this.parseField(f, it));
		let oneOfs = it.oneofsArray.map(o => this.parseOneOf(o, it));

		this._types.push({
			name: it.name,
			proto: it,
			parent,
			fields,
			oneOfs,
		});
	}

	private parseField(it: Field, parent: Type): TsField {
		this.addImport("protobufjs", ["Field"]);

		return {
			name: it.name,
			proto: it,
			parent,
			id: it.id,
			type: this.resolveFieldType(it, parent),
		};
	}

	private parseOneOf(it: OneOf, parent?: ReflectionObject): TsOneOf {
		this.addImport("protobufjs", ["OneOf"]);

		return {
			name: it.name,
			proto: it,
			parent,
			fieldNames: it.fieldsArray.map(f => f.name),
		};
	}

	private resolveFieldType(field: Field, parent: Type) {
		if (/(float|double|[us]?(int|fixed)(32|64))/.test(field.type)) return {
			annotationName: "number",
			decoratorName: `"${field.type}"`,
		};

		if (/(string|bytes)/.test(field.type)) return {
			annotationName: "string",
			decoratorName: `"${field.type}"`,
		};

		if (field.type === "bool") return {
			annotationName: "boolean",
			decoratorName: `"bool"`,
		};

		let siblingTypes = this._types.filter(t => t.parent === parent);
		let match = siblingTypes.find(t => t.name === field.type);

		if (match) {
			let typeName = `${parent.name}_${match.name}`;
			return {
				annotationName: typeName,
				decoratorName: typeName,
			};
		};

		return {
			annotationName: field.type,
			decoratorName: field.type,
		};
	}

	private addImport(source: string, targets: string[]): void {
		if (!this._imports.has(source)) {
			this._imports.set(source, new Set<string>());
		}

		let imports = this._imports.get(source)
		targets.forEach(target => {
			imports.add(target);
		});
	}
}
