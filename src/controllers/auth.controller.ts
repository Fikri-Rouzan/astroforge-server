import { Context } from "hono";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {
  /**
   * Handles HTTP POST request to generate a secure SIWE challenge message
   */
  async requestChallenge(c: Context) {
    try {
      const body = await c.req.json();
      const { walletAddress } = body;

      if (!walletAddress) {
        return c.json(
          { success: false, error: "walletAddress parameter is required." },
          400,
        );
      }

      const challenge = await authService.generateChallenge(walletAddress);

      return c.json(
        {
          success: true,
          data: challenge,
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error:
            error.message || "Failed to generate authentication challenge.",
        },
        400,
      );
    }
  }

  /**
   * Handles HTTP POST request to verify signature and issue a session JWT access token
   */
  async login(c: Context) {
    try {
      const body = await c.req.json();
      const { walletAddress, signature, challengeToken, message } = body;

      // Validate all required parameters for cryptographic verification
      if (!walletAddress || !signature || !challengeToken || !message) {
        return c.json(
          {
            success: false,
            error:
              "Missing parameters. walletAddress, signature, challengeToken, and message are required.",
          },
          400,
        );
      }

      const session = await authService.login(
        walletAddress,
        signature,
        challengeToken,
        message,
      );

      return c.json(
        {
          success: true,
          message:
            "Authentication successful. Space station session established.",
          data: session,
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: error.message || "Authentication login failed.",
        },
        400,
      );
    }
  }
}
