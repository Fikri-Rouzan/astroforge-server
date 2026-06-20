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
      const { walletAddress, shipId } = body;

      // Validate required inputs
      if (!walletAddress || !shipId) {
        return c.json(
          {
            success: false,
            error:
              "Missing required parameters: walletAddress and shipId are required.",
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
      const { walletAddress, shipId } = body;

      // Validate required inputs
      if (!walletAddress || !shipId) {
        return c.json(
          {
            success: false,
            error:
              "Missing required parameters: walletAddress and shipId are required.",
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
