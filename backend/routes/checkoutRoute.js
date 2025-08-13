import express from "express";
import {
  checkoutController,
  verifyPayment,
} from "../controller/checkout/checkoutController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getUnpaidSubOrders,
  paySeller,
} from "../controller/checkout/payToSeller.js";

const router = express.Router();

router.use(authMiddleware); // Apply auth middleware to all routes in this router

router.route("/:id").put(checkoutController);
router.route("/verify").post(verifyPayment);
router.route("/paytoseller/:sellerId").patch(paySeller);
router.route("/paytoseller/unpaid").post(getUnpaidSubOrders);

// router.post("/payment-status");

export default router;
