import mongoose from "mongoose";

const subOrderSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "COMPLETED",
      ],
      default: "PENDING",
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    payableAmount: { type: Number, required: true }, // amount to be paid to seller after commission
    payoutStatus: { type: String, enum: ["PAID", "UNPAID"], default: "UNPAID" }, // UNPAID, PAID
    payoutDate: { type: Date }, // e.g. 2025-W33 // revenue for this seller before commission
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total: { type: Number, required: true }, // total of all subOrders
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
    shippingInfo: {
      name: { type: String },
      address: { type: String },
      city: { type: String },
      phone: { type: String },
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    subOrders: [subOrderSchema], // <-- new: tracks each seller’s contribution
    expireAt: { type: Date }, // field required for TTL
  },
  { timestamps: true }
);

// Set expireAt only for pending orders
orderSchema.pre("save", function (next) {
  if (this.status === "PENDING" && !this.expireAt) {
    this.expireAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
  }
  next();
});

// TTL Index: deletes document once expireAt is reached
orderSchema.index(
  { expireAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: "PENDING" },
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
