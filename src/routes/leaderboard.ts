import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

const boardMeta: Record<string, { label: string; unit: string }> = {
	wishes: { label: "Wishes", unit: "Wishes" },
	achievements: { label: "Achievements", unit: "Unlocked" },
	contingency: { label: "Contingency", unit: "Score" },
};

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function metaFor(key: string): { label: string; unit: string } {
	return (
		boardMeta[key] ?? {
			label: key.charAt(0).toUpperCase() + key.slice(1),
			unit: "Score",
		}
	);
}

function buildRowHtml(entry: LeaderboardEntry): string {
	const username = escapeHtml(entry.username);
	const rankClass = entry.rank <= 3 ? ` lb-rank-${entry.rank}` : "";

	return `<div class="lb-row" data-user="${username.toLowerCase()}"><span class="lb-rank${rankClass}">${entry.rank}</span><span class="lb-player">${username}</span><span class="lb-value">${entry.value.toLocaleString("en-US")}</span></div>`;
}

function buildBoardHtml(
	key: string,
	board: LeaderboardBoard,
	active: boolean,
): string {
	const meta = metaFor(key);
	const rows = board.entries
		.map((entry) => buildRowHtml(entry))
		.join("\n\t\t\t\t\t\t");

	return `<div class="lb-board" data-board="${escapeHtml(key)}"${active ? "" : " hidden"}>
						<div class="lb-row lb-row-head">
							<span class="lb-rank">#</span>
							<span class="lb-player">Player</span>
							<span class="lb-value">${escapeHtml(meta.unit)}</span>
						</div>
						${rows}
						<p class="lb-empty" hidden>No players found.</p>
					</div>`;
}

function buildTabHtml(
	key: string,
	board: LeaderboardBoard,
	active: boolean,
): string {
	const meta = metaFor(key);

	return `<button type="button" class="lb-tab${active ? " lb-tab-active" : ""}" data-tab="${escapeHtml(key)}">${escapeHtml(meta.label)}<span class="lb-tab-count">${board.entries.length}</span></button>`;
}

async function handler(_request: ExtendedRequest): Promise<Response> {
	let data: LeaderboardResponse;

	try {
		const res = await fetch(environment.leaderboardApiUrl);
		data = (await res.json()) as LeaderboardResponse;
	} catch {
		return await serveView("leaderboard", {
			BOT_INVITE: environment.botInvite,
			LEADERBOARD_TABS: "",
			LEADERBOARD_CONTENT: "",
		});
	}

	const keys = Object.keys(data).filter(
		(key) => /^[a-z0-9_-]+$/i.test(key) && Array.isArray(data[key]?.entries),
	);

	const tabs = keys
		.map((key, index) => buildTabHtml(key, data[key], index === 0))
		.join("\n\t\t\t\t\t");

	const content = keys
		.map((key, index) => buildBoardHtml(key, data[key], index === 0))
		.join("\n\t\t\t\t\t");

	return await serveView("leaderboard", {
		BOT_INVITE: environment.botInvite,
		LEADERBOARD_TABS: tabs,
		LEADERBOARD_CONTENT: content,
	});
}

export { handler, routeDef };
