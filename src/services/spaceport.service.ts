import { gameConfig } from "../config/game.config.js";
import { prisma } from "../db/client.js";

export class SpaceportService {
  /**
   * Refuels the player's tank by exchanging gathered Iron Ore
   */
  async refuel(walletAddress: string, fuelAmountToBuy: number) {
    if (fuelAmountToBuy <= 0)
      throw new Error("Fuel amount must be greater than zero.");

    const player = await prisma.player.findUnique({
      where: { walletAddress },
    });

    if (!player) throw new Error("Player profile not found.");

    // Calculate the target fuel level and ensure it does not exceed maximum capacity
    const currentFuel = player.fuel;
    const maxCapacity = gameConfig.refuel.maxFuelCapacity;

    if (currentFuel >= maxCapacity)
      throw new Error("Fuel tank is already full.");

    let finalFuelToPurchase = fuelAmountToBuy;
    if (currentFuel + fuelAmountToBuy > maxCapacity) {
      finalFuelToPurchase = maxCapacity - currentFuel;
    }

    // Calculate dynamic Iron Ore cost
    const totalIronOreCost =
      finalFuelToPurchase * gameConfig.refuel.ironOreCostPerFuel;
    if (Number(player.ironOre) < totalIronOreCost) {
      throw new Error(
        `Insufficient Iron Ore! Needs ${totalIronOreCost} Iron Ore.`,
      );
    }

    // Execute database transaction to deduct resource and add fuel
    return await prisma.$transaction(async (tx) => {
      return await tx.player.update({
        where: { walletAddress },
        data: {
          ironOre: { decrement: totalIronOreCost },
          fuel: { increment: finalFuelToPurchase },
        },
      });
    });
  }

  /**
   * Upgrades a spaceship's stats using Iron Ore
   */
  async upgradeShip(walletAddress: string, shipId: number) {
    const ship = await prisma.ship.findFirst({
      where: { id: shipId, playerWallet: walletAddress },
      include: { player: true },
    });

    if (!ship) throw new Error("Ship not found or does not belong to you.");
    if (ship.status !== "IDLE")
      throw new Error(
        "Cannot upgrade ship while it is out on a mining mission!",
      );

    // Calculate dynamic cost based on current mining performance
    const currentMiningRate = Number(ship.miningRatePerSecond);
    const upgradeCost = Math.floor(
      currentMiningRate * gameConfig.upgrade.baseCostMultiplier,
    );

    if (Number(ship.player.ironOre) < upgradeCost) {
      throw new Error(
        `Insufficient Iron Ore! Upgrade requires ${upgradeCost} Iron Ore.`,
      );
    }

    // Compute new upgraded statistics
    const newMiningRate =
      currentMiningRate + gameConfig.upgrade.miningRateIncrement;
    const newMaxCargo =
      Number(ship.maxCargo) + gameConfig.upgrade.maxCargoIncrement;

    // Execute atomic database transaction
    return await prisma.$transaction(async (tx) => {
      // Deduct upgrade cost from the player
      await tx.player.update({
        where: { walletAddress },
        data: { ironOre: { decrement: upgradeCost } },
      });

      // Apply upgrades permanently to the spaceship
      const upgradedShip = await tx.ship.update({
        where: { id: shipId },
        data: {
          miningRatePerSecond: newMiningRate,
          maxCargo: newMaxCargo,
        },
      });

      return {
        costPaid: upgradeCost,
        ship: upgradedShip,
      };
    });
  }
}
