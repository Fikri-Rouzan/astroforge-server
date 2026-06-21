import { Context, type Next } from "hono";
import { verify } from "hono/jwt";
import { env } from "../config/env.config.js";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  // Verify if the Authorization header exists and follows the Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: "Unauthorized access. Missing or invalid token format.",
      },
      401,
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!env.jwtSecret) {
      throw new Error("JWT configuration secret is missing on the server.");
    }

    // Verify and decode the token safely
    const payload = (await verify(token, env.jwtSecret, "HS256")) as {
      walletAddress: string;
    };

    // Inject the verified wallet address securely
    c.set("walletAddress", payload.walletAddress);

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Unauthorized access. Token is either invalid or expired.",
      },
      401,
    );
  }
}
