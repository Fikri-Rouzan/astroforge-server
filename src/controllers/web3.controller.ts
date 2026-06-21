import { Context } from "hono";
import { Web3Service } from "../services/web3.service.js";

const web3Service = new Web3Service();

export class Web3Controller {
  /**
   * Handles HTTP POST request to secure a web3 withdrawal voucher
   */
  async requestWithdrawal(c: Context) {
    try {
      const body = await c.req.json();
      const { walletAddress, ironOreAmount } = body;

      if (!walletAddress || !ironOreAmount) {
        return c.json(
          {
            success: false,
            error: "walletAddress and ironOreAmount parameters are required.",
          },
          400,
        );
      }

      const voucher = await web3Service.generateWithdrawVoucher(
        walletAddress,
        Number(ironOreAmount),
      );

      return c.json(
        {
          success: true,
          message:
            "Withdrawal voucher secured successfully. Valid for 10 minutes.",
          data: voucher,
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error:
            error.message || "Internal server error during withdrawal request.",
        },
        400,
      );
    }
  }
}
