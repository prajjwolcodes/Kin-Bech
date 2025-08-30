import express from "express";
import {
  checkoutController,
  verifyPayment,
} from "../controller/checkout/checkoutController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getSellersWithUnpaid,
  paySellerAtOnce,
} from "../controller/checkout/payToSeller.js";

const router = express.Router();

router.use(authMiddleware); // Apply auth middleware to all routes in this router

router.route("/:id").put(checkoutController);
router.route("/verify").post(verifyPayment);
router.route("/paytoseller/:sellerId").patch(paySellerAtOnce);
router.route("/unpaid").get(getSellersWithUnpaid);

// router.post("/payment-status");

export default router;
