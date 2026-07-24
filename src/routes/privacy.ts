import { resolve } from "node:path";
import { marked } from "marked";
import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

const privacyFile = resolve("data", "privacy.md");

async function handler(_request: ExtendedRequest): Promise<Response> {
	const md = await Bun.file(privacyFile).text();
	const content = await marked.parse(md);
	const siteUrl = environment.siteUrl.replace(/\/+$/, "");

	return await serveView("legal", {
		BOT_INVITE: environment.botInvite,
		LEGAL_TITLE: "Privacy Policy",
		LEGAL_CONTENT: content,
		SITE_URL: siteUrl,
		OG_IMAGE_URL: `${siteUrl}/public/assets/bot/avatar.png`,
		CANONICAL_URL: `${siteUrl}/privacy`,
	});
}

export { handler, routeDef };
