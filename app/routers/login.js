//Global imports
import express from "express";

//Local imports
import { errorHandler } from "../helpers/Helpers.js";
import { getView, login } from "../controllers/login.js";
import { redirectMiddleware } from "../middlewares/middlewares.js";


const router = new express.Router();


router
.route("")
.get(errorHandler(getView))
.post(errorHandler(login))

export default router;