import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil");
  globalForDb.pgClient ??= postgres(url, { max: 10 });
  return globalForDb.pgClient;
}

export const db = drizzle({ client: client(), schema });
