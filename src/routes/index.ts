import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

async function handler(_request: ExtendedRequest): Promise<Response> {
	const siteUrl = environment.siteUrl.replace(/\/+$/, "");

	return await serveView("index", {
		BOT_INVITE: environment.botInvite,
		DISCORD_INVITE: environment.discordInvite,
		SOURCE_URL: environment.sourceUrl,
		SITE_URL: siteUrl,
		OG_IMAGE_URL: `${siteUrl}/public/assets/bot/avatar.png`,
		CANONICAL_URL: siteUrl,
	});
}

export { handler, routeDef };
