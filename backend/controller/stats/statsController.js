import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import OrderItem from "../../models/orderItemModel.js";
import Payment from "../../models/paymentModel.js";
import Product from "../../models/productModel.js";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getPlatformStats = async (req, res) => {
  try {
    // =========================
    // BASIC USER COUNTS
    // =========================
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });

    // New users this month
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // =========================
    // ORDERS & REVENUE
    // =========================
    const completedOrders = await Order.find({ status: "COMPLETED" }).lean();
    const orderIds = completedOrders.map((o) => o._id);

    const payments = await Payment.find({
      orderId: { $in: orderIds },
      status: "PAID",
    }).lean();

    const totalOrders = await Order.countDocuments();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const platformCommission = totalRevenue * 0.05;

    // =========================
    // REVENUE DATA (Last 6 Months)
    // =========================
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const monthlyData = await Payment.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      { $match: { "order.status": "COMPLETED" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const revenueData = monthlyData.map((m) => ({
      month: monthNames[m._id.month - 1],
      revenue: m.revenue,
      commission: m.revenue * 0.05,
      orders: m.orders,
    }));

    // =========================
    // USER GROWTH DATA (Last 6 Months)
    // =========================
    const userGrowthAgg = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const userGrowthData = [];
    const monthRoleMap = {};

    userGrowthAgg.forEach((u) => {
      const key = `${u._id.year}-${u._id.month}`;
      if (!monthRoleMap[key]) {
        monthRoleMap[key] = {
          month: monthNames[u._id.month - 1],
          buyers: 0,
          sellers: 0,
        };
      }
      if (u._id.role === "buyer") {
        monthRoleMap[key].buyers = u.count;
      } else if (u._id.role === "seller") {
        monthRoleMap[key].sellers = u.count;
      }
    });

    Object.values(monthRoleMap).forEach((m) => userGrowthData.push(m));

    let orderGrowth = 0;
    let revenueGrowth = 0;

    if (revenueData.length >= 2) {
      const last = revenueData[revenueData.length - 1];
      const prev = revenueData[revenueData.length - 2];

      // Orders growth
      if (prev.orders > 0) {
        orderGrowth = ((last.orders - prev.orders) / prev.orders) * 100;
      }

      // Revenue growth
      if (prev.revenue > 0) {
        revenueGrowth = ((last.revenue - prev.revenue) / prev.revenue) * 100;
      }
    }

    // =========================
    // RESPONSE
    // =========================
    const platformAnalytics = {
      completedOrders: completedOrders.length,
      totalUsers,
      totalSellers,
      totalUsers,
      totalSellers,
      totalBuyers,
      totalOrders,
      totalRevenue,
      platformCommission,
      newUsersThisMonth,
      orderGrowth: orderGrowth.toFixed(2), // e.g. 12.34
      revenueGrowth: revenueGrowth.toFixed(2),
    };

    res.json({
      message: "Successfully fetched platform statistics",
      platformAnalytics,
      revenueData,
      userGrowthData,
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id.toString();

    // ----------------------------
    // Total products & low stock
    // ----------------------------
    const totalProducts = await Product.countDocuments({ sellerId });
    const lowStockProducts = await Product.countDocuments({
      sellerId,
      count: { $lte: 5 },
    });

    // ----------------------------
    // Fetch all orders with this seller’s subOrders
    // ----------------------------
    const orders = await Order.find({ "subOrders.sellerId": sellerId }).lean();

    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;

    for (const order of orders) {
      // Find this seller’s subOrder inside the order
      const subOrder = order.subOrders.find(
        (so) => so.sellerId.toString() === sellerId
      );
      if (!subOrder) continue;

      totalOrders++; // ✅ count 1 order for this seller

      if (
        subOrder.status === "COMPLETED" &&
        subOrder.paymentStatus === "PAID"
      ) {
        totalRevenue += subOrder.total;
      }

      if (subOrder.status !== "COMPLETED") {
        pendingOrders++;
      }
    }

    const sellerRevenue = totalRevenue * 0.95; // after 5% commission

    // ----------------------------
    // Monthly revenue (last 6 months)
    // ----------------------------
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    // Pull only orders in the last 6 months with this seller’s subOrders
    const monthlyData = await Order.aggregate([
      {
        $match: {
          "subOrders.sellerId": req.user._id,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      { $unwind: "$subOrders" },
      {
        $match: {
          "subOrders.sellerId": req.user._id,
          "subOrders.status": "COMPLETED",
          "subOrders.paymentStatus": "PAID",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$subOrders.total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const found = monthlyData.find(
        (m) => m._id.year === year && m._id.month === month
      );
      revenueData.push({
        month: monthNames[month - 1],
        revenue: found ? found.revenue * 0.95 : 0,
      });
    }

    // ----------------------------
    // Monthly Growth %
    // ----------------------------
    let monthlyGrowth = 0;
    if (revenueData.length >= 2) {
      const last = revenueData[revenueData.length - 1].revenue;
      const prev = revenueData[revenueData.length - 2].revenue;
      if (prev > 0) {
        monthlyGrowth = ((last - prev) / prev) * 100;
      }
    }

    // ----------------------------
    // Response
    // ----------------------------
    res.json({
      stats: {
        totalProducts,
        totalOrders, // ✅ one per seller subOrder
        totalRevenue: sellerRevenue,
        monthlyGrowth: monthlyGrowth.toFixed(2),
        pendingOrders,
        lowStockProducts,
      },
      revenueData,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    // Recent 5 users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const recentOrders = await Order.find({ status: "COMPLETED" })
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate("buyerId", "username")
      .lean();

    const recentPayments = await Payment.find({ status: "UNPAID" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Map into unified activity format
    const activities = [];

    recentUsers.forEach((u) => {
      activities.push({
        type: "user",
        message: `New ${u.role} registered: ${u.username}`,
        time: u.createdAt,
        color: u.role === "seller" ? "green" : "blue",
      });
    });

    recentOrders.forEach((o) => {
      activities.push({
        type: "order",
        message: `Large order completed: Rs. ${o.total.toFixed(2)}`,
        time: o.updatedAt,
        color: "blue",
      });
    });

    recentPayments.forEach((p) => {
      activities.push({
        type: "payment",
        message: `User reported issue: Payment of Rs. ${p.amount.toFixed(
          2
        )} failed`,
        time: p.createdAt,
        color: "yellow",
      });
    });

    // Sort by most recent
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ activities: activities.slice(0, 10) }); // send top 10
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
