import { Hono } from "hono";
import { Web3Controller } from "../controllers/web3.controller.js";

const web3Router = new Hono();
const web3Controller = new Web3Controller();

web3Router.post("/withdraw", (c) => web3Controller.requestWithdrawal(c));
web3Router.post("/cancel", (c) => web3Controller.cancelWithdrawal(c));

export { web3Router };
