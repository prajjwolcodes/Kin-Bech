// controllers/payoutController.js
import Order from "../../models/orderModel.js";
import User from "../../models/userModel.js";

// Get all sellers with unpaid amounts
export const getSellersWithUnpaid = async (req, res) => {
  try {
    const unpaid = await Order.aggregate([
      { $unwind: "$subOrders" },
      {
        $match: {
          "subOrders.status": "COMPLETED",
          "subOrders.payoutStatus": "UNPAID",
        },
      },
      {
        $group: {
          _id: "$subOrders.sellerId",
          payableAmount: { $sum: "$subOrders.payableAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $project: {
          _id: 1,
          payableAmount: 1,
          totalOrders: 1,
          "seller.username": 1,
          "seller.email": 1,
        },
      },
    ]);

    res.json({ sellers: unpaid });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pay seller at once
export const paySellerAtOnce = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({
      "subOrders.sellerId": sellerId,
      "subOrders.status": "COMPLETED",
      "subOrders.payoutStatus": "UNPAID",
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No unpaid subOrders found" });
    }

    let totalPaid = 0;

    orders.forEach((order) => {
      order.subOrders.forEach((sub) => {
        if (
          sub.sellerId.toString() === sellerId &&
          sub.status === "COMPLETED" &&
          sub.payoutStatus === "UNPAID"
        ) {
          totalPaid += sub.payableAmount;
          sub.payoutStatus = "PAID";
          sub.payoutDate = new Date();
          sub.payableAmount = 0; // reset
        }
      });
    });

    await Promise.all(orders.map((o) => o.save()));

    res.json({ message: "Seller paid successfully", totalPaid });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
