import { resolve } from "node:path";
import { marked } from "marked";
import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

const termsFile = resolve("data", "terms.md");

async function handler(_request: ExtendedRequest): Promise<Response> {
	const md = await Bun.file(termsFile).text();
	const content = await marked.parse(md);

	return await serveView("legal", {
		BOT_INVITE: environment.botInvite,
		LEGAL_TITLE: "Terms of Service",
		LEGAL_CONTENT: content,
	});
}

export { handler, routeDef };
