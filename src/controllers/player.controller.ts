import { Context } from "hono";
import { PlayerService } from "../services/player.service.js";

const playerService = new PlayerService();

export class PlayerController {
  /**
   * Handles HTTP request for new player registration
   */
  async register(c: Context) {
    try {
      const body = await c.req.json();
      const { walletAddress } = body;

      // Validate required inputs
      if (!walletAddress) {
        return c.json(
          {
            success: false,
            error: "Missing required parameter: walletAddress is required.",
          },
          400,
        );
      }

      // Simple length validation for EVM wallet addresses
      if (walletAddress.length !== 42) {
        return c.json(
          {
            success: false,
            error:
              "Invalid wallet address format. Must be a valid 42-character address.",
          },
          400,
        );
      }

      const result = await playerService.registerPlayer(walletAddress);

      return c.json(
        {
          success: true,
          message:
            "Player registered and starter assets provisioned successfully.",
          data: result,
        },
        201,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error:
            error.message ||
            "Internal server error occurred during player registration.",
        },
        400,
      );
    }
  }
}
