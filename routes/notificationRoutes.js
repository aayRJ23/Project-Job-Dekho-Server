import express from "express";
import {
  getMyNotifications,
  markOneRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall", isAuthenticated, getMyNotifications);
router.patch("/read/:id", isAuthenticated, markOneRead);
router.patch("/readall", isAuthenticated, markAllRead);

export default router;