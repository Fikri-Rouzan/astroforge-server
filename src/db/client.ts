import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { env } from "../config/env.config.js";

// Force stop the server immediately if DATABASE_URL is missing at runtime
if (!env.databaseUrl || env.databaseUrl.trim() === "") {
  console.error(
    "[AstroForge Error] DATABASE_URL is missing from the environment variables!",
  );
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: env.databaseUrl,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
