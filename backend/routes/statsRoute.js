import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAdminSellerStats,
  getPlatformStats,
  getRecentActivity,
  getSellerStats,
} from "../controller/stats/statsController.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").get(getPlatformStats);
router.route("/seller").get(getSellerStats);
router.route("/recent-activity").get(getRecentActivity);
router.route("/seller-stats-admin").get(getAdminSellerStats);

export default router;
