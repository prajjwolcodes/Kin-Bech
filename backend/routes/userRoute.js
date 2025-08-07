import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getSellerStats,
} from "../controller/userController/userController.js";

const router = express.Router();

router.use(authMiddleware); // Apply auth middleware to all routes in this router

router.route("/").get(getAllUsers);
router.route("/seller").get(getSellerStats);

export default router;
