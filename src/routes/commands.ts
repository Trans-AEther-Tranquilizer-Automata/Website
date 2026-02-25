import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

function escapeHtml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildCommandHtml(command: Command): string {
	const name = escapeHtml(command.name);
	const desc = escapeHtml(command.description);
	const argsHtml = command.options
		.map((o) => {
			const label = escapeHtml(o.name) + (o.required ? "" : "?");
			return `<span class="cmd-args"><span class="cmd-arg">${label}</span></span>`;
		})
		.join("");

	return `<div class="cmd-item" data-cmd="/${name}"><div class="cmd-info"><span class="cmd-name">/${name}</span>${argsHtml}<span class="cmd-desc">${desc}</span></div></div>`;
}

function buildCategoryHtml(category: CommandCategory): string {
	const name = escapeHtml(category.name);
	const commands = category.commands
		.map((cmd) => buildCommandHtml(cmd))
		.join("\n\t\t\t\t\t\t");

	return `<div class="cmd-category" data-category="${name}">
						<h2 class="cmd-category-title">${name}</h2>
						${commands}
					</div>`;
}

async function handler(_request: ExtendedRequest): Promise<Response> {
	let data: CommandsResponse;

	try {
		const res = await fetch(environment.commandsApiUrl);
		data = (await res.json()) as CommandsResponse;
	} catch {
		return await serveView("commands", {
			BOT_INVITE: environment.botInvite,
			COMMANDS_CONTENT: "",
			COMMANDS_COUNT: "0",
		});
	}

	const totalCommands = data.categories.reduce(
		(sum, cat) => sum + cat.commands.length,
		0,
	);

	const content = data.categories
		.map((cat) => buildCategoryHtml(cat))
		.join("\n\t\t\t\t\t");

	return await serveView("commands", {
		BOT_INVITE: environment.botInvite,
		COMMANDS_CONTENT: content,
		COMMANDS_COUNT: totalCommands.toString(),
	});
}

export { handler, routeDef };
