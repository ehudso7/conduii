import { config as dotenvConfig } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// loads apps/web/.env
dotenvConfig({ path: path.resolve(__dirname, "../.env") });

const url = process.env.DIRECT_URL;

if (!url) {
  console.error("DIRECT_URL is missing");
  process.exit(1);
}

const client = new Client({ connectionString: url });

try {
  await client.connect();
  const res = await client.query("select current_user, current_database(), now();");
  console.log("✅ Connected:", res.rows[0]);
  await client.end();
} catch (err) {
  console.error("❌ Connection failed:", err?.message || err);
  process.exit(1);
}
