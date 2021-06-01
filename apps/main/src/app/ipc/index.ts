import * as main from "./main"
import * as pipeModule from "./pipe";

namespace ipc {
	export const init = main.init;
	export const pipe = pipeModule.pipe;
}

export default ipc;
