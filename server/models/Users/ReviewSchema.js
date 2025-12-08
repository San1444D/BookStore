
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Customer" – match your user model name
      required: true,
    },
    userName: { type: String, required: true }, // snapshot of name at time of review
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    title: { type: String, trim: true },
    text: { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

const reviewModel =
  mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default reviewModel;
