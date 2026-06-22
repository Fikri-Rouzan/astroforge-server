import { ethers } from "ethers";
import { env } from "../config/env.config.js";
import { gameConfig } from "../config/game.config.js";
import { prisma } from "../db/client.js";

export class Web3Service {
  private adminWallet: ethers.Wallet;

  constructor() {
    if (!env.adminPrivateKey) {
      throw new Error(
        "SERVER_ADMIN_PRIVATE_KEY is missing from environment variables.",
      );
    }
    // Initialize the cryptography signer using the server's private key
    this.adminWallet = new ethers.Wallet(env.adminPrivateKey);
  }

  /**
   * Validates off-chain assets and generates a secure cryptographic voucher for on-chain minting
   */
  async generateWithdrawVoucher(
    walletAddress: string,
    ironOreAmountToWithdraw: number,
  ) {
    if (ironOreAmountToWithdraw <= 0)
      throw new Error("Withdrawal amount must be greater than zero.");

    // Fetch current player state
    const player = await prisma.player.findUnique({
      where: { walletAddress },
    });

    if (!player) throw new Error("Player profile not found.");
    if (Number(player.ironOre) < ironOreAmountToWithdraw) {
      throw new Error(
        `Insufficient Iron Ore balance. Available: ${player.ironOre}`,
      );
    }

    // Calculate Token amount and setup security bounds
    const tokenAmountOnChain =
      ironOreAmountToWithdraw / gameConfig.web3.conversionRate;
    const currentNonce = player.nonce;
    const expiryTimestamp =
      Math.floor(Date.now() / 1000) + gameConfig.web3.voucherExpiryDuration;

    // Atomically update database FIRST (Deduct assets and increment nonce to block race-conditions)
    await prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { walletAddress },
        data: {
          ironOre: { decrement: ironOreAmountToWithdraw },
          nonce: { increment: 1 },
        },
      });
    });

    try {
      // Construct the cryptographic EIP-191 compliant message hash
      const tokenAmountInWei = ethers.parseEther(tokenAmountOnChain.toString());

      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256", "uint256", "address"],
        [
          walletAddress,
          tokenAmountInWei,
          currentNonce,
          expiryTimestamp,
          env.tokenContractAddress,
        ],
      );

      // Sign the hash with the server's private key
      const signature = await this.adminWallet.signMessage(
        ethers.getBytes(messageHash),
      );

      // Return the voucher package to the frontend
      return {
        recipient: walletAddress,
        tokenAmount: tokenAmountOnChain.toString(),
        rawAmountInWei: tokenAmountInWei.toString(),
        nonce: currentNonce,
        expiry: expiryTimestamp,
        signature: signature,
      };
    } catch (cryptoError) {
      // Rollback database manually if cryptographic signing fails unexpectedly
      await prisma.$transaction(async (tx) => {
        await tx.player.update({
          where: { walletAddress },
          data: {
            ironOre: { increment: ironOreAmountToWithdraw },
            nonce: { decrement: 1 },
          },
        });
      });
      throw new Error("Failed to generate secure cryptographic signature.");
    }
  }

  /**
   * Automatically restores player assets and decrements nonce if a Web3 transaction is rejected
   */
  async rollbackWithdrawVoucher(
    walletAddress: string,
    ironOreAmountToRefund: number,
  ) {
    const player = await prisma.player.findUnique({
      where: { walletAddress },
    });

    if (!player) throw new Error("Player profile not found.");

    // Prevent nonce from dropping below zero
    if (player.nonce === 0) return;

    // Execute atomic transaction to restore resources
    return await prisma.$transaction(async (tx) => {
      return await tx.player.update({
        where: { walletAddress },
        data: {
          ironOre: { increment: ironOreAmountToRefund },
          nonce: { decrement: 1 },
        },
      });
    });
  }
}
