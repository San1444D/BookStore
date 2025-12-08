import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const adminModel =
  mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
export default adminModel;
