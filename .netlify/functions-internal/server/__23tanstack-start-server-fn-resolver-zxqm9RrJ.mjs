//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-zxqm9RrJ.js
var manifest = { "7f0f53526890a1d5aae8d4759a15c0ed46944f380fbb2bec4afe394be0760c9c": {
	functionName: "analyzeEmail_createServerFn_handler",
	importer: () => import("./_ssr/phishing.functions-sNCxzgQ3.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
