// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";
import userModel from "../models/Users/UserSchema.js";
import adminModel from "../models/Admin/AdminSchema.js";
import sellerModel from "../models/Seller/SellerSchema.js";

const MODEL_BY_ROLE = {
  user: userModel,
  admin: adminModel,
  seller: sellerModel,
};

const ROLE_CLAIM = {
  user: "USER",
  admin: "ADMIN",
  seller: "SELLER",
};

const getModel = (role) => {
  const lower = (role || "").toLowerCase();
  const Model = MODEL_BY_ROLE[lower];
  if (!Model) throw new Error("Invalid role");
  return { Model, roleKey: lower };
};

const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({success:false, message: "All fields are required" });
    }

    const { Model, roleKey } = getModel(role);

    const existing = await Model.findOne({ email });
    if (existing) {
      return res.status(409).json({success:false, message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const doc = await Model.create({ name, email, password: hash });

    const token = signToken({
      id: doc._id,
      name: doc.name,
      role: ROLE_CLAIM[roleKey],
    });

    res.status(201).json({
      success: true,
      message: "Account created",
      token,
      role: roleKey,
      user: { id: doc._id, name: doc.name, email: doc.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, message: "Signup failed" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({success:false, message: "All fields are required" });
    }

    const { Model, roleKey } = getModel(role);

    const doc = await Model.findOne({ email });
    if (!doc) {
      return res.status(401).json({success:false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, doc.password);
    if (!ok) {
      return res.status(401).json({ success:false, message: "Invalid credentials" });
    }


    const token = signToken({
      id: doc._id,
      name: doc.name,
      role: ROLE_CLAIM[roleKey],
    });

    res.json({
      message: "Login successful",
      token,
      role: roleKey,
      user: { id: doc._id, name: doc.name, email: doc.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, message: "Login failed" });
  }
};
