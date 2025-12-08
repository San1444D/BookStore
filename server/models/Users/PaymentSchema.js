import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    // Buyer/User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Seller (money receiver)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    // Order Reference
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Razorpay order ID
    razorpay_order_id: {
      type: String,
      required: true,
    },

    // Razorpay Payment ID
    razorpay_payment_id: {
      type: String,
    },

    // Razorpay Signature
    razorpay_signature: {
      type: String,
    },

    // Amount
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // Payment Status
    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded"],
      default: "created",
    },

    // Method (UPI / NetBanking / Card / Wallet)
    method: {
      type: String,
    },

    // Invoice / Description
    description: {
      type: String,
    },

    // Refund info
    refundId: {
      type: String,
    },
  },
  { timestamps: true }
);

const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;
