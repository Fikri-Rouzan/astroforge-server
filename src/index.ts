import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env.config.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { miningRouter } from "./routes/mining.routes.js";
import { playerRouter } from "./routes/player.routes.js";
import { spaceportRouter } from "./routes/spaceport.routes.js";
import { web3Router } from "./routes/web3.routes.js";

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

// Public Authentication Endpoint
app.route("/api/auth", authRouter);

// Global Security Layer Activation
app.use("/api/mining/*", authMiddleware);
app.use("/api/player/*", authMiddleware);
app.use("/api/spaceport/*", authMiddleware);
app.use("/api/web3/*", authMiddleware);

// Mount Protected Routers
app.route("/api/mining", miningRouter);
app.route("/api/player", playerRouter);
app.route("/api/spaceport", spaceportRouter);
app.route("/api/web3", web3Router);

console.log(`[AstroForge] Server is running on http://localhost:${env.port}`);

serve({
  fetch: app.fetch,
  port: Number(env.port),
});
