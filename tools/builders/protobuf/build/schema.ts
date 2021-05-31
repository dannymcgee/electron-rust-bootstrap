import { json } from '@angular-devkit/core';

export interface Options extends json.JsonObject {
	/** Path to .proto files */
	protosPath: string;
}
