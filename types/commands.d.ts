type CommandOption = {
	name: string;
	description: string;
	required: boolean;
	type: number;
};

type Command = {
	name: string;
	description: string;
	type: number;
	usage: string | null;
	options: CommandOption[];
};

type CommandCategory = {
	name: string;
	commands: Command[];
};

type CommandsResponse = {
	categories: CommandCategory[];
};
