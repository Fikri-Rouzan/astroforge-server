import { Context } from "hono";
import { PlayerService } from "../services/player.service.js";

const playerService = new PlayerService();

export class PlayerController {
  /**
   * Handles HTTP GET request to fetch the verified caller's profile and hangar data
   */
  async getProfile(c: Context) {
    try {
      // Securely read who is requesting data directly from the verified token payload
      const walletAddress = c.get("walletAddress");

      const profileData = await playerService.getPlayerProfile(walletAddress);

      return c.json(
        {
          success: true,
          data: profileData,
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error:
            error.message ||
            "Internal server error occurred while fetching profile.",
        },
        400,
      );
    }
  }
}
