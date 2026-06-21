import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller.js";

const authRouter = new Hono();
const authController = new AuthController();

authRouter.post("/challenge", (c) => authController.requestChallenge(c));
authRouter.post("/login", (c) => authController.login(c));

export { authRouter };
