import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.config.js";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not defined in your environment variables!");
}

const pool = new Pool({ connectionString: env.databaseUrl });

const adapter = new PrismaNeon(pool as any);

export const prisma = new PrismaClient({ adapter });
