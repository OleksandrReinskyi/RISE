//Global imports
import express from "express";

//Local imports
import { errorHandler } from "../helpers/Helpers.js";
import { exportHome, getView } from "../controllers/home.js";
import { adminOnly, redirectMiddleware } from "../middlewares/middlewares.js";



const router = new express.Router();


router
.route("/")
.get(errorHandler(getView))

router
.post("/export",adminOnly,errorHandler(exportHome))


export default router;