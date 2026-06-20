import { Hono } from "hono";
import { PlayerController } from "../controllers/player.controller.js";

const playerRouter = new Hono();
const playerController = new PlayerController();

playerRouter.post("/register", (c) => playerController.register(c));

export { playerRouter };
