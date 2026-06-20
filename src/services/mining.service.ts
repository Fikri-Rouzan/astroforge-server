import { prisma } from "../db/client.js";

export class MiningService {
  /**
   * Launches a spaceship to the asteroid belt for mining
   */
  async launchShip(walletAddress: string, shipId: number) {
    // Fetch the ship and its owner simultaneously
    const ship = await prisma.ship.findFirst({
      where: { id: shipId, playerWallet: walletAddress },
      include: { player: true },
    });

    if (!ship) throw new Error("Ship not found or does not belong to you!");
    if (ship.status !== "IDLE")
      throw new Error("Ship is already on a mission or mining!");
    if (ship.player.fuel < 10)
      throw new Error("Insufficient fuel! Requires at least 10 fuel.");

    // Execute database transaction
    return await prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { walletAddress },
        data: { fuel: { decrement: 10 } },
      });

      // Update ship status to MINING and record the current timestamp
      const updatedShip = await tx.ship.update({
        where: { id: shipId },
        data: {
          status: "MINING",
          lastLaunchTime: new Date(),
        },
      });

      return updatedShip;
    });
  }

  /**
   * Recalls the ship back to the hangar and claims the mined resources
   */
  async claimMining(walletAddress: string, shipId: number) {
    // Fetch the ship data
    const ship = await prisma.ship.findFirst({
      where: { id: shipId, playerWallet: walletAddress },
    });

    if (!ship) throw new Error("Ship not found!");
    if (ship.status !== "MINING" || !ship.lastLaunchTime) {
      throw new Error("Ship is not currently mining!");
    }

    // Calculate passive delta-time logic
    const currentTime = new Date().getTime();
    const launchTime = new Date(ship.lastLaunchTime).getTime();

    // Calculate the difference in seconds
    const deltaTimeInSeconds = Math.floor((currentTime - launchTime) / 1000);

    if (deltaTimeInSeconds < 5) {
      throw new Error(
        "Mining duration is too short! Minimum duration is 5 seconds.",
      );
    }

    // Calculate mining resources gathered
    const miningRate = Number(ship.miningRatePerSecond);
    const maxCargo = Number(ship.maxCargo);

    let ironOreEarned = deltaTimeInSeconds * miningRate;

    // Cap the earnings with the ship's maximum cargo capacity to prevent exploits
    if (ironOreEarned > maxCargo) {
      ironOreEarned = maxCargo;
    }

    // Update the database and reset the ship status to IDLE
    return await prisma.$transaction(async (tx) => {
      // Add the mined iron ore to the player's balance
      await tx.player.update({
        where: { walletAddress },
        data: { ironOre: { increment: ironOreEarned } },
      });

      // Reset the ship status back to the hangar
      const resetShip = await tx.ship.update({
        where: { id: shipId },
        data: {
          status: "IDLE",
          lastLaunchTime: null,
        },
      });

      return {
        ship: resetShip,
        durationSeconds: deltaTimeInSeconds,
        oreEarned: ironOreEarned,
      };
    });
  }
}
