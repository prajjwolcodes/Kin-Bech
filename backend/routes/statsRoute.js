import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getPlatformStats,
  getRecentActivity,
  getSellerStats,
} from "../controller/stats/statsController.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").get(getPlatformStats);
router.route("/seller").get(getSellerStats);
router.route("/recent-activity").get(getRecentActivity);

export default router;
