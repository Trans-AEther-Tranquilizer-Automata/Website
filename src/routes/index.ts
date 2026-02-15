import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

async function handler(_request: ExtendedRequest): Promise<Response> {
	return await serveView("index", {
		BOT_INVITE: environment.botInvite,
		DISCORD_INVITE: environment.discordInvite,
		SOURCE_URL: environment.sourceUrl,
	});
}

export { handler, routeDef };
