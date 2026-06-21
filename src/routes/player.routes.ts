import { Hono } from "hono";
import { PlayerController } from "../controllers/player.controller.js";

const playerRouter = new Hono();
const playerController = new PlayerController();

playerRouter.get("/profile", (c) => playerController.getProfile(c));

export { playerRouter };
