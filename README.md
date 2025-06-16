# Planning poker

## Use the app

1. Clone the repository
2. Create a `.env.production` file in the web folder with the contents of `.env.example`
3. Run `npx drizzle-kit migrate` to create the SQLite database
4. Run `docker compose up`

## Development

1. Clone the repository
2. Create a `.env` file in the web folder with the contents of `.env.example`
3. Run `pnpm install`
4. Run `pnpm db:migrate` to create the SQLite database
5. Switch to the `web` folder and run `pnpm dev`
6. Install `air` with `go install github.com/air-verse/air@latest`
7. Switch to `websocket` folder and run `air`
