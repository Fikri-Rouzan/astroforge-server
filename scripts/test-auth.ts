import { ethers } from "ethers";

const BACKEND_URL = "http://localhost:3000/api";
// A random dummy private key to simulate a player's MetaMask wallet locally
const PLAYER_PRIVATE_KEY =
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const playerWallet = new ethers.Wallet(PLAYER_PRIVATE_KEY);

async function runAuthenticationTest() {
  console.log(`[Test] Simulating player wallet: ${playerWallet.address}`);

  try {
    // Request a secure challenge message from the backend
    const challengeRes = await fetch(`${BACKEND_URL}/auth/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: playerWallet.address }),
    });

    const challengeData = await challengeRes.json();
    if (!challengeData.success) throw new Error(challengeData.error);

    const { message, challengeToken } = challengeData.data;
    console.log("[Test] Challenge message received successfully.");

    // Simulate player signing the message via MetaMask cryptographically
    console.log("[Test] Signing message cryptographically...");
    const signature = await playerWallet.signMessage(message);

    // Submit the signature to the backend login endpoint
    console.log("[Test] Submitting signature for verification...");
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: playerWallet.address,
        signature,
        challengeToken,
        message,
      }),
    });

    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(loginData.error);

    const { accessToken } = loginData.data;
    console.log("\n========= LOGIN SUCCESS =========");
    console.log("Copy this Access Token to use in Postman Bearer Auth:");
    console.log(`${accessToken}`);
    console.log("=================================\n");
  } catch (error: any) {
    console.error("[Test Error]:", error.message);
  }
}

runAuthenticationTest();
