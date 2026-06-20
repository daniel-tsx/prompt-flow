import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

export type Database = ReturnType<typeof createClient>;

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Copy .env.example to .env.local and set your Neon connection string.",
    );
  }
  return drizzle(neon(url), { schema });
}

// Lazily instantiated so importing this module never throws at build time.
// The connection (and the missing-env error) only happens on first query.
let client: Database | undefined;

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    if (!client) client = createClient();
    const value = client[prop as keyof Database];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { schema };
