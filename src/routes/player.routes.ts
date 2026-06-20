import { Hono } from "hono";
import { PlayerController } from "../controllers/player.controller.js";

const playerRouter = new Hono();
const playerController = new PlayerController();

playerRouter.post("/register", (c) => playerController.register(c));
playerRouter.get("/profile/:walletAddress", (c) =>
  playerController.getProfile(c),
);

export { playerRouter };
