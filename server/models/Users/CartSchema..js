// models/CartSchema.js
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    title: String,
    author: String,
    itemImage: String,
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

const cartModel = mongoose.models.Cart || mongoose.model("Cart", CartSchema);

export default cartModel;
