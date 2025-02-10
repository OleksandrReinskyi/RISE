//Global imports
import express from "express";

//Local imports
import { errorHandler } from "../helpers/Helpers.js";
import {redirectMiddleware } from "../middlewares/middlewares.js";
import { logout } from "../controllers/logout.js";



const router = new express.Router();


router
.route("")
.get(redirectMiddleware,errorHandler(logout))



export default router;