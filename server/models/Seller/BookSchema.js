import mongoose, { mongo } from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genres: [{ type: String, required: true }],

    description: String,
    price: { type: Number, required: true },
    itemImage: String,
    pages: { type: Number, min: 100 },

    // stock management
    stockStatus: {
      type: String,
      enum: ["IN_STOCK", "OUT_OF_STOCK"],
      default: "IN_STOCK",
    },
    stockCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    sellerName: String,
  },
  { timestamps: true }
);

const bookModel = mongoose.models.Book || mongoose.model("Book", BookSchema);

export default bookModel;
