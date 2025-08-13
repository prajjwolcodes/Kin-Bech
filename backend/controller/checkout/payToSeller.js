import Order from "../../models/orderModel.js";
import User from "../../models/userModel.js";

// Get seller stats
export const getSellerStats = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" });

    const stats = await Promise.all(
      sellers.map(async (seller) => {
        const completedOrders = await Order.aggregate([
          { $unwind: "$subOrders" },
          {
            $match: {
              "subOrders.sellerId": seller._id,
              "subOrders.status": "COMPLETED",
            },
          },
          {
            $group: {
              _id: "$subOrders.sellerId",
              totalOrders: { $sum: 1 },
              revenue: { $sum: "$subOrders.subtotal" },
              commission: { $sum: "$subOrders.commission" },
              payableAmount: {
                $sum: {
                  $cond: [
                    { $eq: ["$subOrders.paymentStatus", "UNPAID"] },
                    "$subOrders.payableAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]);

        const s = stats[0] || {
          totalOrders: 0,
          revenue: 0,
          commission: 0,
          payableAmount: 0,
        };

        return {
          _id: seller._id,
          username: seller.username,
          email: seller.email,
          totalOrders: s.totalOrders,
          completedOrders: s.totalOrders, // same as totalOrders for completed status
          totalRevenue: s.revenue,
          commission: s.commission,
          payableAmount: s.payableAmount,
        };
      })
    );

    res.json({ sellers: stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pay seller
// PATCH /sellers/:id/pay
export const paySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Find all unpaid subOrders for this seller
    const orders = await Order.find({
      "subOrders.sellerId": sellerId,
      "subOrders.payoutStatus": "UNPAID",
      "subOrders.payableAmount": { $gt: 0 },
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No unpaid subOrders found" });
    }

    let totalPaid = 0;

    // Update all subOrders for this seller
    orders.forEach((order) => {
      order.subOrders.forEach((sub) => {
        if (
          sub.sellerId.toString() === sellerId &&
          sub.payoutStatus === "UNPAID" &&
          sub.payableAmount > 0
        ) {
          totalPaid += sub.payableAmount;
          sub.payoutStatus = "PAID";
          sub.payoutDate = new Date();
          sub.payableAmount = 0;
        }
      });
    });

    // Save all updated orders
    await Promise.all(orders.map((o) => o.save()));

    res.json({
      message: "All unpaid subOrders for seller marked as PAID",
      totalPaid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUnpaidSubOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "subOrders.payoutStatus": "UNPAID",
      "subOrders.status": "COMPLETED",
    }).populate("subOrders.sellerId", "name phone");

    // Flatten subOrders into a single array
    const unpaidSubOrders = orders.flatMap((order) =>
      order.subOrders.filter(
        (s) => s.payoutStatus === "UNPAID" && s.status === "COMPLETED"
      )
    );

    res.json(unpaidSubOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
