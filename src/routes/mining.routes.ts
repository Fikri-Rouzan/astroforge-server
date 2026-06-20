import { Hono } from "hono";
import { MiningController } from "../controllers/mining.controller.js";

const miningRouter = new Hono();
const miningController = new MiningController();

miningRouter.post("/launch", (c) => miningController.launchShip(c));
miningRouter.post("/claim", (c) => miningController.claimMining(c));

export { miningRouter };
