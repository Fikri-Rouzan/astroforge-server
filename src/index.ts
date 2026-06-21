import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env.config.js";
import { miningRouter } from "./routes/mining.routes.js";
import { playerRouter } from "./routes/player.routes.js";
import { spaceportRouter } from "./routes/spaceport.routes.js";

const app = new Hono();

// Enable CORS middleware
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["POST", "GET", "OPTIONS"],
  }),
);

// Base health check route
app.get("/", (c) => c.text("AstroForge Server is Operational!"));

// Mount modular routes
app.route("/api/mining", miningRouter);
app.route("/api/player", playerRouter);
app.route("/api/spaceport", spaceportRouter);

console.log(`[AstroForge] Server is running on http://localhost:${env.port}`);

serve({
  fetch: app.fetch,
  port: Number(env.port),
});
