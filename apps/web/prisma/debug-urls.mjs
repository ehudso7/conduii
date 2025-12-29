import { config as dotenvConfig } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve apps/web/.env reliably even when run from repo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// prisma/ is inside apps/web/prisma, so ../.env is apps/web/.env
dotenvConfig({ path: path.resolve(__dirname, "../.env") });

function safeParse(name) {
  const raw = process.env[name];
  if (!raw) {
    console.log(`${name}: MISSING`);
    return;
  }

  try {
    const u = new URL(raw);
    console.log(`${name}: OK`);
    console.log({
      protocol: u.protocol,
      username: u.username || "(empty)",
      hasPassword: Boolean(u.password && u.password.length > 0),
      host: u.host,
      pathname: u.pathname,
      search: u.search,
    });
  } catch (e) {
    console.log(`${name}: INVALID_URL`);
    console.log(String(e));
  }
}

safeParse("POSTGRES_PRISMA_URL");
safeParse("DIRECT_URL");
