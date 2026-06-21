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
      const { fuelAmount } = body;

      // Securely extract the verified wallet address from the auth middleware context
      const walletAddress = c.get("walletAddress");

      if (!fuelAmount) {
        return c.json(
          {
            success: false,
            error: "fuelAmount parameter is required.",
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
      const { shipId } = body;

      // Securely extract the verified wallet address from the auth middleware context
      const walletAddress = c.get("walletAddress");

      if (!shipId) {
        return c.json(
          {
            success: false,
            error: "shipId parameter is required.",
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
