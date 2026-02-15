import { resolve } from "node:path";
import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

const commandsFile = resolve("data", "commands.txt");

async function handler(_request: ExtendedRequest): Promise<Response> {
	const file = Bun.file(commandsFile);
	const text = await file.text();

	const lines = text
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.length > 0);

	const items: string[] = [];

	for (const line of lines) {
		const parts = line.split("|").map((p) => p.trim());
		const name = parts[0] ?? "";
		const desc = (parts[1] ?? "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
		const opt = parts[2] ?? "";
		const optional = parts[3] === "?";

		const argsHtml =
			opt && optional
				? `<span class="cmd-args"><span class="cmd-arg">${opt}?</span></span>`
				: "";

		items.push(
			`<div class="cmd-item" data-cmd="/${name}"><div class="cmd-info"><span class="cmd-name">/${name}</span>${argsHtml}<span class="cmd-desc">${desc}</span></div><span class="cmd-bot">Tata</span></div>`,
		);
	}

	return await serveView("commands", {
		BOT_INVITE: environment.botInvite,
		COMMANDS_CONTENT: items.join("\n\t\t\t\t\t"),
		COMMANDS_COUNT: lines.length.toString(),
	});
}

export { handler, routeDef };
