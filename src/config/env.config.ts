import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  adminPrivateKey: process.env.SERVER_ADMIN_PRIVATE_KEY,
  tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS,
};
