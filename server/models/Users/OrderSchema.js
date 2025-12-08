import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    // snapshot so history is safe if book changes later
    title: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true }, // price * quantity
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // shipping address
    flatno: String,
    pincode: String,
    city: String,
    state: String,

    // money
    totalAmount: { type: Number, required: true, min: 0 },

    // one order can have many books
    items: {
      type: [OrderItemSchema],
      validate: [(v) => v.length > 0, "Order must have at least one item"],
    },

    // relations
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    BookingDate: { type: Date, default: Date.now },

    Delivery: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
      },
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const OrderModel =
  mongoose.models.MyOrder || mongoose.model("MyOrder", OrderSchema);

export default OrderModel;
