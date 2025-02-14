//Global imports
import express from "express";

//Local imports
import { errorHandler } from "../helpers/Helpers.js";
import { getView, requestFromUser } from "../controllers/order.js";
import { adminOnly } from "../middlewares/middlewares.js";


const router = new express.Router();


router
.route("/")
.get(getView)
.delete(requestFromUser)
.post(requestFromUser)


export default router;