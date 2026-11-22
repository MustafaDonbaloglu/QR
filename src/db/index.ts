import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { qrDb?: Db };

/** Connect lazily so `next build` can load modules without DATABASE_URL. */
function getDb(): Db {
  if (!globalForDb.qrDb) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL tanımlı değil");
    globalForDb.qrDb = drizzle({ client: postgres(url, { max: 10 }), schema });
  }
  return globalForDb.qrDb;
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
