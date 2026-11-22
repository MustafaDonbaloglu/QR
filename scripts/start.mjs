// Container entrypoint: apply DB migrations, then start the Next.js standalone server.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

for (const key of ["DATABASE_URL", "ADMIN_PASSWORD", "SESSION_SECRET", "PUBLIC_BASE_URL"]) {
  if (!process.env[key]) {
    console.error(`Eksik ortam değişkeni: ${key}`);
    process.exit(1);
  }
}
if (process.env.SESSION_SECRET.length < 32) {
  console.error("SESSION_SECRET en az 32 karakter olmalı");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await migrate(drizzle({ client: sql }), { migrationsFolder: path.join(here, "drizzle") });
  console.log("Migrations applied");
} finally {
  await sql.end();
}

await import(path.join(here, "server.js"));
