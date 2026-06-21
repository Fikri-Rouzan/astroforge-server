import { Context } from "hono";
import { MiningService } from "../services/mining.service.js";

const miningService = new MiningService();

export class MiningController {
  /**
   * Handles HTTP request to launch a spaceship
   */
  async launchShip(c: Context) {
    try {
      const body = await c.req.json();
      const { shipId } = body;

      // Securely extract the verified wallet address from the auth middleware context
      const walletAddress = c.get("walletAddress");

      // Validate required inputs
      if (!shipId) {
        return c.json(
          {
            success: false,
            error: "Missing required parameter: shipId is required.",
          },
          400,
        );
      }

      const updatedShip = await miningService.launchShip(
        walletAddress,
        Number(shipId),
      );

      return c.json(
        {
          success: true,
          message: "Spaceship launched successfully.",
          data: updatedShip,
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error:
            error.message ||
            "Internal server error occurred during ship launch.",
        },
        400,
      );
    }
  }

  /**
   * Handles HTTP request to claim mined resources
   */
  async claimMining(c: Context) {
    try {
      const body = await c.req.json();
      const { shipId } = body;

      // Securely extract the verified wallet address from the auth middleware context
      const walletAddress = c.get("walletAddress");

      // Validate required inputs
      if (!shipId) {
        return c.json(
          {
            success: false,
            error: "Missing required parameter: shipId is required.",
          },
          400,
        );
      }

      const result = await miningService.claimMining(
        walletAddress,
        Number(shipId),
      );

      return c.json(
        {
          success: true,
          message: "Resources claimed successfully.",
          data: result,
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error:
            error.message ||
            "Internal server error occurred during resource claim.",
        },
        400,
      );
    }
  }
}
