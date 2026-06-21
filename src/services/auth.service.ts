import { ethers } from "ethers";
import { sign, verify } from "hono/jwt";
import { env } from "../config/env.config.js";
import { prisma } from "../db/client.js";

export class AuthService {
  /**
   * Generates a unique secure time-bound challenge string
   */
  async generateChallenge(walletAddress: string) {
    const nonce = Math.floor(100000 + Math.random() * 900000).toString();
    const timestamp = Date.now();

    const message = `Welcome to AstroForge!\nSign this message to securely log into your space station.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    if (!env.jwtSecret)
      throw new Error("Server security secret configuration is missing.");

    // Create a very short-lived token containing the challenge parameters
    const challengeToken = await sign(
      { nonce, walletAddress, exp: Math.floor(Date.now() / 1000) + 180 },
      env.jwtSecret,
      "HS256",
    );

    return { message, challengeToken };
  }

  /**
   * Verifies the signature cryptographic proof and issues a login session JWT
   */
  async login(
    walletAddress: string,
    signature: string,
    challengeToken: string,
    message: string,
  ) {
    if (!env.jwtSecret)
      throw new Error("Server security secret configuration is missing.");

    // Verify the challenge token state issued by our server to block tampering
    let payload;
    try {
      payload = (await verify(challengeToken, env.jwtSecret, "HS256")) as {
        walletAddress: string;
      };
    } catch (err) {
      throw new Error(
        "Authentication challenge has expired or is invalid. Please request a new challenge.",
      );
    }

    if (payload.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error("Wallet address mismatch within the verification token.");
    }

    // Cryptographically recover the signer address from the signature and match it
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error(
        "Cryptographic signature verification failed. Access denied.",
      );
    }

    // Fetch or automatically create player if profile doesn't exist
    let player = await prisma.player.findUnique({ where: { walletAddress } });
    let isNewRegistration = false;

    if (!player) {
      isNewRegistration = true;
      player = await prisma.$transaction(async (tx) => {
        const newPlayer = await tx.player.create({
          data: { walletAddress, ironOre: 0, platinum: 0, fuel: 100, nonce: 0 },
        });
        await tx.ship.create({
          data: {
            playerWallet: walletAddress,
            shipName: "Genesis Miner",
            miningRatePerSecond: 0.2,
            maxCargo: 500,
            status: "IDLE",
          },
        });
        return newPlayer;
      });
    }

    // Issue a long-lived session Access Token
    const accessToken = await sign(
      { walletAddress, exp: Math.floor(Date.now() / 1000) + 86400 },
      env.jwtSecret,
      "HS256",
    );

    return {
      accessToken,
      walletAddress: player.walletAddress,
      isNewRegistration,
    };
  }
}
