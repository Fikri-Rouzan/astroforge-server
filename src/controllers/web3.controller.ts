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
      const { ironOreAmount } = body;

      // Securely extract the verified wallet address from the auth middleware context
      const walletAddress = c.get("walletAddress");

      if (!ironOreAmount) {
        return c.json(
          {
            success: false,
            error: "ironOreAmount parameter is required.",
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

  /**
   * Handles HTTP POST request to rollback a pending withdrawal voucher
   */
  async cancelWithdrawal(c: Context) {
    try {
      const body = await c.req.json();
      const { ironOreAmount } = body;
      const walletAddress = c.get("walletAddress");

      if (!ironOreAmount) {
        return c.json(
          {
            success: false,
            error: "ironOreAmount parameter is required for rollback.",
          },
          400,
        );
      }

      await web3Service.rollbackWithdrawVoucher(
        walletAddress,
        Number(ironOreAmount),
      );

      return c.json(
        {
          success: true,
          message:
            "Refinery rollback complete. Assets safely restored to cargo hold.",
        },
        200,
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: error.message || "Rollback execution failed.",
        },
        500,
      );
    }
  }
}
