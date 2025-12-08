import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: String,

    addressFlatno: String,
    addressPincode: String,
    addressCity: String,
    addressState: String,
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default userModel;
