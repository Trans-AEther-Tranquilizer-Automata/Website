type LeaderboardEntry = {
	rank: number;
	userid: string;
	username: string;
	value: number;
};

type LeaderboardBoard = {
	entries: LeaderboardEntry[];
};

type LeaderboardResponse = Record<string, LeaderboardBoard>;
