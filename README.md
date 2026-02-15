# Tata Bot Website

Landing page for Tata, an Arknights: Endfield utility bot for Discord.

Built with [Bun](https://bun.sh) and plain HTML/CSS/JS.

## Setup

```sh
cp .env.example .env
bun install
bun run dev
```

## Docker

```sh
docker pull ghcr.io/trans-aether-tranquilizer-automata/website:latest
```

Or use the compose file:

```sh
cp .env.example .env
docker compose up -d
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HOST` | Server host |
| `PORT` | Server port |
| `BOT_INVITE` | Discord bot invite URL |
| `DISCORD_INVITE` | Discord server invite URL |
| `SOURCE_URL` | Source code repository URL |

## Data

Commands and showcase content are driven by text files in `data/`.

- `data/commands.txt` — bot commands (`name | description | option | ?`)
- `data/showcase/` — images with optional `.txt` descriptions
