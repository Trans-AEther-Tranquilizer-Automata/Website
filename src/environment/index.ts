import { echo } from "@atums/echo";
import { requiredVariables } from "#environment/constants";

const environment: Environment = {
	port: Number.parseInt(process.env.PORT || "8080", 10),
	host: process.env.HOST || "0.0.0.0",
	development:
		process.env.NODE_ENV === "development" || process.argv.includes("--dev"),
	botInvite: process.env.BOT_INVITE || "#",
	discordInvite: process.env.DISCORD_INVITE || "#",
	sourceUrl: process.env.SOURCE_URL || "https://github.com/Trans-AEther-Tranquilizer-Automata/Website",
};

function verifyRequiredVariables(): void {
	let hasError = false;

	for (const key of requiredVariables) {
		const value = process.env[key];
		if (value === undefined || value.trim() === "") {
			echo.error(`Missing or empty environment variable: ${key}`);
			hasError = true;
		}
	}

	if (hasError) {
		process.exit(1);
	}
}

export { environment, verifyRequiredVariables };
