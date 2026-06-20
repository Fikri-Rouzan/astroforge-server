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

  /**
   * Fetches the complete player profile, hangar data, and calculates real-time pending resources
   */
  async getPlayerProfile(walletAddress: string) {
    // Fetch player along with all their spaceships
    const player = await prisma.player.findUnique({
      where: { walletAddress },
      include: { ships: true },
    });

    if (!player) {
      throw new Error("Player profile not found!");
    }

    // Map through ships to inject real-time dynamic pending resources
    const updatedShips = player.ships.map((ship) => {
      let pendingIronOre = 0;
      let elapsedSeconds = 0;

      if (ship.status === "MINING" && ship.lastLaunchTime) {
        const currentTime = new Date().getTime();
        const launchTime = new Date(ship.lastLaunchTime).getTime();

        // Calculate exact seconds elapsed since launch
        elapsedSeconds = Math.floor((currentTime - launchTime) / 1000);

        if (elapsedSeconds > 0) {
          const miningRate = Number(ship.miningRatePerSecond);
          const maxCargo = Number(ship.maxCargo);

          pendingIronOre = elapsedSeconds * miningRate;

          // Cap with max cargo hold capacity
          if (pendingIronOre > maxCargo) {
            pendingIronOre = maxCargo;
          }
        }
      }

      // Return the ship object bundled with live telemetry data
      return {
        ...ship,
        telemetry: {
          elapsedSeconds,
          pendingIronOre: pendingIronOre.toFixed(4),
        },
      };
    });

    // Return consolidated dashboard data
    return {
      walletAddress: player.walletAddress,
      balances: {
        ironOre: player.ironOre,
        platinum: player.platinum,
        fuel: player.fuel,
      },
      nonce: player.nonce,
      createdAt: player.createdAt,
      hangar: updatedShips,
    };
  }
}
