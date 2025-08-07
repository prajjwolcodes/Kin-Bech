import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";

export async function getAllUsers(req, res) {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Only admins can view all orders." });
  }

  try {
    const users = await User.find({}).select("-password").lean();
    res.status(200).json({ message: "All users fetched successfully", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSellerStats(req, res) {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Only admins can view user data." });
  }

  try {
    const sellers = await User.find({ role: "seller" })
      .select("-password")
      .lean();

    const orders = await Order.find({}).lean();

    const sellerStats = sellers.map((seller) => {
      let totalOrders = 0;
      let completedOrders = 0;
      let totalRevenue = 0;
      let payableAmount = 0;
      let commission = 0;

      for (const order of orders) {
        for (const sub of order.subOrders || []) {
          if (sub.sellerId?.toString() === seller._id.toString()) {
            totalOrders++;

            if (sub.status === "COMPLETED") {
              completedOrders++;
              totalRevenue += sub.subtotal;

              const sellerShare = sub.subtotal * 0.95;
              const adminCommission = sub.subtotal * 0.05;

              payableAmount += sellerShare;
              commission += adminCommission;
            }
          }
        }
      }

      return {
        _id: seller._id,
        username: seller.username,
        email: seller.email,
        totalOrders,
        completedOrders,
        totalRevenue,
        commission,
        payableAmount,
      };
    });

    res.status(200).json({
      message: "Seller statistics fetched successfully",
      sellers: sellerStats,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
