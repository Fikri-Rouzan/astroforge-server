import { Context } from "hono";
import { SpaceportService } from "../services/spaceport.service.js";

const spaceportService = new SpaceportService();

export class SpaceportController {
  /**
   * Handles HTTP POST request for refueling fuel tanks
   */
  async refuel(c: Context) {
    try {
      const body = await c.req.json();
      const { walletAddress, fuelAmount } = body;

      if (!walletAddress || !fuelAmount) {
        return c.json(
          {
            success: false,
            error: "walletAddress and fuelAmount parameters are required.",
          },
          400,
        );
      }

      const updatedPlayer = await spaceportService.refuel(
        walletAddress,
        Number(fuelAmount),
      );

      return c.json(
        {
          success: true,
          message: "Refuel protocol complete. Tank replenished.",
          data: {
            walletAddress: updatedPlayer.walletAddress,
            currentFuel: updatedPlayer.fuel,
            remainingIronOre: updatedPlayer.ironOre,
          },
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: error.message || "Internal server error during refuel.",
        },
        400,
      );
    }
  }

  /**
   * Handles HTTP POST request to trigger spaceship hardware upgrades
   */
  async upgradeShip(c: Context) {
    try {
      const body = await c.req.json();
      const { walletAddress, shipId } = body;

      if (!walletAddress || !shipId) {
        return c.json(
          {
            success: false,
            error: "walletAddress and shipId parameters are required.",
          },
          400,
        );
      }

      const result = await spaceportService.upgradeShip(
        walletAddress,
        Number(shipId),
      );

      return c.json(
        {
          success: true,
          message: "Spaceship hardware modules successfully upgraded.",
          data: result,
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: error.message || "Internal server error during upgrade.",
        },
        400,
      );
    }
  }
}
