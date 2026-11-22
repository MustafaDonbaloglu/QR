import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export async function runMigrations(migrationsFolder = "./drizzle"): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil");
  const sql = postgres(url, { max: 1 });
  try {
    await migrate(drizzle({ client: sql }), { migrationsFolder });
  } finally {
    await sql.end();
  }
}
