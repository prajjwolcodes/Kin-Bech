import OrderItem from "../../models/orderItemModel.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/productModel.js";
import mongoose from "mongoose";

export async function createOrder(req, res) {
  const buyerId = req.user._id;
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({ message: "Access denied. Only buyers can create orders." });
  }

  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Items are required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );

    if (products.length !== items.length) {
      throw new Error("One or more products not found");
    }

    const orderItems = [];
    let total = 0;

    // Track items per seller
    const sellerMap = new Map();

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      if (product.count < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Decrease stock
      await product.save({ session });

      const subTotal = product.price * item.quantity;
      total += subTotal;

      const orderItem = {
        orderId: null, // fill later
        productId: product._id,
        price: product.price,
        quantity: item.quantity,
        sellerId: product.sellerId,
      };

      orderItems.push(orderItem);

      // Group by seller
      const sellerId = product.sellerId.toString();
      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, { total: 0, items: [] });
      }
      const sellerData = sellerMap.get(sellerId);
      sellerData.total += subTotal;
      sellerData.items.push(orderItem);
    }

    // Create subOrders with seller-specific items
    const subOrders = Array.from(sellerMap.entries()).map(
      ([sellerId, { total, items }]) => ({
        sellerId,
        status: "PENDING",
        subtotal: total,
        paymentStatus: "UNPAID",
        payoutStatus: "UNPAID",
        payableAmount: total * 0.95, // 95% to seller
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      })
    );

    const [order] = await Order.create([{ buyerId, total, subOrders }], {
      session,
    });

    // Set orderId in orderItems
    orderItems.forEach((i) => (i.orderId = order._id));
    await OrderItem.insertMany(orderItems, { session });

    await session.commitTransaction();

    // Populate subOrder items with product details
    const populatedOrder = await Order.findById(order._id)
      .populate("subOrders.items.productId")
      .lean();

    session.endSession();

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: { order: populatedOrder },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order:", err);
    res
      .status(500)
      .json({ status: "error", message: err.message || "Internal error" });
  }
}

export async function getOrderById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid Order ID" });
  }

  try {
    const order = await Order.findById(id)
      .lean()
      .populate("payment", "method status");
    if (!order) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    const items = await OrderItem.find({ orderId: id })
      .populate("productId")
      .lean();

    res.json({
      status: "success",
      message: "Order retrieved",
      data: { order, items },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

export async function getBuyerOrders(req, res) {
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({ message: "Access denied. Only buyers can view their orders." });
  }
  const buyerId = req.user._id;

  try {
    const orders = await Order.find({ buyerId })
      .sort({ createdAt: -1 })
      .lean()
      .populate("payment", "method status");
    const orderIds = orders.map((o) => o._id);
    const items = await OrderItem.find({ orderId: { $in: orderIds } })
      .populate("productId")
      .lean();

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: items.filter((i) => i.orderId.toString() === order._id.toString()),
    }));

    res.json({
      status: "success",
      message: "Buyer orders retrieved",
      data: { orders: ordersWithItems },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

export async function getAllOrders(req, res) {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Only admins can view all orders." });
  }
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean()
      .populate("payment", "method status amount")
      .populate(
        "subOrders.items.productId",
        "name description imageUrl count categoryId"
      )
      .populate("subOrders.sellerId", "username")
      .populate("buyerId");

    const orderIds = orders.map((o) => o._id);
    const items = await OrderItem.find({ orderId: { $in: orderIds } })
      .populate("productId")
      .populate({
        path: "productId",
        populate: {
          path: "sellerId", // field inside Product schema
        },
      })
      .lean();

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: items.filter((i) => i.orderId.toString() === order._id.toString()),
    }));

    res.json({
      status: "success",
      message: "All orders retrieved",
      data: { orders: ordersWithItems },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

// Seller POV: list only orders containing their products
export async function getSellerOrders(req, res) {
  if (req.user.role !== "seller") {
    return res
      .status(403)
      .json({ message: "Access denied. Only sellers can view their orders." });
  }

  const sellerId = req.user._id;

  try {
    // Find all orders that contain at least one subOrder for this seller
    const orders = await Order.find({ "subOrders.sellerId": sellerId })
      .sort({ createdAt: -1 })
      .populate("buyerId", "username email")
      .populate("payment", "method status amount")
      .populate({
        path: "subOrders.items",
        populate: {
          path: "productId",
          select: "name description imageUrl count categoryId",
        },
      })
      .lean();

    // Extract only this seller’s subOrders
    const sellerOrders = orders.map((order) => {
      const sellerSubOrder = order.subOrders.find(
        (sub) => sub.sellerId.toString() === sellerId.toString()
      );
      return {
        _id: order._id,
        buyerId: order.buyerId,
        shippingInfo: order.shippingInfo,
        payment: order.payment,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        // seller-specific data
        subOrder: {
          sellerId: sellerSubOrder.sellerId,
          items: sellerSubOrder.items,
          subtotal: sellerSubOrder.subtotal,
          status: sellerSubOrder.status,
        },
      };
    });

    res.json({
      status: "success",
      message: "Seller orders retrieved",
      data: { orders: sellerOrders },
    });
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Only sellers and admin can update order status.",
    });
  }

  const { id } = req.params; // orderId
  const { status } = req.body;
  const sellerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id) || !status) {
    return res
      .status(400)
      .json({ status: "error", message: "Order ID and status required" });
  }

  try {
    const order = await Order.findById(id)
      .populate("payment", "method status")
      .populate("buyerId");

    if (!order) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    // Admin can update the full order
    if (req.user.role === "admin") {
      order.status = status;
      await order.save();
      return res.json({
        status: "success",
        message: "Order status updated by admin",
        data: { order },
      });
    }

    // Seller: update only their subOrder
    const subOrder = order.subOrders.find(
      (s) => s.sellerId.toString() === sellerId.toString()
    );

    if (!subOrder) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this order",
      });
    }

    subOrder.status = status;

    // If all subOrders are COMPLETED → mark main order COMPLETED
    if (order.subOrders.every((s) => s.status === "COMPLETED")) {
      order.status = "COMPLETED";
    }

    await order.save();

    res.json({
      status: "success",
      message: "Order status updated",
      data: { order },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

export async function updatePaymentStatus(req, res) {
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    return res.status(403).json({
      message:
        "Access denied. Only sellers and admin can update payment status.",
    });
  }

  const { id } = req.params; // orderId
  const { status } = req.body;
  const sellerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id) || !status) {
    return res
      .status(400)
      .json({ status: "error", message: "Order ID and status required" });
  }

  try {
    const order = await Order.findById(id)
      .populate("payment", "method status")
      .populate("buyerId");

    if (!order) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    // Admin can update the overall payment status
    if (req.user.role === "admin") {
      if (order.payment) {
        order.payment.status = status;
        await order.payment.save();
      }
      return res.json({
        status: "success",
        message: "Payment status updated by admin",
        data: { order },
      });
    }

    // Seller updates their own subOrder payment status
    const subOrder = order.subOrders.find(
      (s) => s.sellerId.toString() === sellerId.toString()
    );

    if (!subOrder) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this payment",
      });
    }

    // Update the payment status inside subOrder
    if (!subOrder.payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found for this subOrder",
      });
    }

    // Assuming payment inside subOrder is an ObjectId ref, populate it first
    await subOrder.populate("payment");

    if (!subOrder.payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment document missing",
      });
    }

    subOrder.payment.status = status;
    await subOrder.payment.save();

    // Optionally: if all subOrders payments are PAID, update main order payment status
    const allPaid = order.subOrders.every((s) => s.payment?.status === "PAID");
    if (allPaid && order.payment) {
      order.payment.status = "PAID";
      await order.payment.save();
    }

    await order.save();

    res.json({
      status: "success",
      message: "Payment status updated",
      data: { order },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

export async function cancelOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderId = req.params.id;

    const orderItems = await OrderItem.find({ orderId })
      .populate("productId")
      .session(session);

    // Restore product stock
    for (const item of orderItems) {
      const product = item.productId;
      product.count += item.quantity;
      await product.save({ session });
    }

    // Optionally update order status or delete it
    // await Order.findByIdAndUpdate(orderId, { status: "CANCELLED" }, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Order canceled and stock restored." });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
}
