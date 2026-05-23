const path = require("node:path");
const { spawnSync } = require("node:child_process");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const tsxEntrypoint = require.resolve("tsx/dist/cli.mjs");

const result = spawnSync(process.execPath, [tsxEntrypoint, "src/prisma/seed.ts"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
