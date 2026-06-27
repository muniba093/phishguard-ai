import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/phishing.functions-sNCxzgQ3.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var InputSchema = objectType({
	subject: stringType().max(500),
	sender: stringType().max(200),
	body: stringType().min(1).max(2e4)
});
var SYSTEM_PROMPT = `You are an expert cybersecurity AI specializing in phishing email detection.
Analyze the provided email and return ONLY a JSON response in this exact format:
{
  "verdict": "PHISHING" or "SAFE",
  "confidence": 87.5,
  "risk_level": "Critical" or "High" or "Medium" or "Low",
  "indicators": {
    "suspicious_links": true,
    "urgency_language": true,
    "sender_mismatch": false,
    "grammar_issues": false,
    "personal_info_request": true,
    "impersonation": true,
    "suspicious_attachments": false
  },
  "explanation": "2-3 sentence explanation of findings"
}
Return ONLY valid JSON, no extra text.`;
var analyzeEmail_createServerFn_handler = createServerRpc({
	id: "7f0f53526890a1d5aae8d4759a15c0ed46944f380fbb2bec4afe394be0760c9c",
	name: "analyzeEmail",
	filename: "src/lib/phishing.functions.ts"
}, (opts) => analyzeEmail.__executeServer(opts));
var analyzeEmail = createServerFn({ method: "POST" }).inputValidator((d) => InputSchema.parse(d)).handler(analyzeEmail_createServerFn_handler, async ({ data }) => {
	const key = process.env.LOVABLE_API_KEY;
	if (!key) throw new Error("AI service not configured");
	const userMsg = `Subject: ${data.subject}\nFrom: ${data.sender}\nBody:\n${data.body}`;
	const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Lovable-API-Key": key
		},
		body: JSON.stringify({
			model: "google/gemini-3-flash-preview",
			messages: [{
				role: "system",
				content: SYSTEM_PROMPT
			}, {
				role: "user",
				content: userMsg
			}],
			response_format: { type: "json_object" }
		})
	});
	if (!res.ok) {
		if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
		if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
		throw new Error(`AI gateway error: ${res.status}`);
	}
	const cleaned = ((await res.json()).choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		throw new Error("AI returned an invalid response. Please try again.");
	}
	return parsed;
});
//#endregion
export { analyzeEmail_createServerFn_handler };
