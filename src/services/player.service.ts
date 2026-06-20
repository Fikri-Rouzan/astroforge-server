import { prisma } from "../db/client.js";

export class PlayerService {
  /**
   * Registers a new player and provisions a free starter spaceship
   */
  async registerPlayer(walletAddress: string) {
    // Check if the player already exists in the database
    const existingPlayer = await prisma.player.findUnique({
      where: { walletAddress },
    });

    if (existingPlayer) {
      throw new Error("Player wallet address is already registered!");
    }

    // Execute a database transaction to ensure both player and starter ship are created safely
    return await prisma.$transaction(async (tx) => {
      // Create the new player profile with default balances
      const newPlayer = await tx.player.create({
        data: {
          walletAddress: walletAddress,
          ironOre: 0,
          platinum: 0,
          fuel: 100,
          nonce: 0,
        },
      });

      // Provision a free starter spaceship for the registered player
      const starterShip = await tx.ship.create({
        data: {
          playerWallet: walletAddress,
          shipName: "Genesis Miner",
          miningRatePerSecond: 0.2,
          maxCargo: 500,
          status: "IDLE",
        },
      });

      return {
        player: newPlayer,
        starterShip: starterShip,
      };
    });
  }
}
