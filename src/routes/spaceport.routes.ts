import { Hono } from "hono";
import { SpaceportController } from "../controllers/spaceport.controller.js";

const spaceportRouter = new Hono();
const spaceportController = new SpaceportController();

spaceportRouter.post("/refuel", (c) => spaceportController.refuel(c));
spaceportRouter.post("/upgrade", (c) => spaceportController.upgradeShip(c));

export { spaceportRouter };
