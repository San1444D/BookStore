// models/Users/WishlistSchema.js
import mongoose from "mongoose";

const WishlistItemSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    title: String,
    author: String,
    itemImage: String,
    price: Number,
  },
  { _id: false }
);

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);

const wishlistModel =
  mongoose.models.UserWishlist ||
  mongoose.model("UserWishlist", WishlistSchema);

export default wishlistModel;
