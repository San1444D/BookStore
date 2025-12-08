// controllers/AdminController.js
import userModel from "../models/Users/UserSchema.js";
import sellerModel from "../models/Seller/SellerSchema.js";
import bookModel from "../models/Seller/BookSchema.js";
import orderModel from "../models/Users/OrderSchema.js";
import mongoose from "mongoose";



export const getAdminStats = async (req, res) => {
  try {
    const [users, sellers, books, orders] = await Promise.all([
      userModel.countDocuments({}),
      sellerModel.countDocuments({}),
      bookModel.countDocuments({}),
      orderModel.countDocuments({}),
    ]);

    res.json({
      users,
      sellers,
      books,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};


// ==============================================================================================================================
// USERS SECTION
//

// GET /api/admin/users  ==== Get Users ====
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load users" });
  }
};

// POST /api/admin/users  ==== create user ====
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const user = await userModel.create({ name, email, password });
    res.status(201).json({
      message: "User created",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// PATCH /api/admin/users/:id  ==== update user ====
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const user = await userModel
      .findByIdAndUpdate(req.params.id, updates, { new: true })
      .select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// DELETE /api/admin/users/:id  ==== delete user ====
export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// GET /api/admin/users/:id/orders ==== view orders ====
export const getUserOrders = async (req, res) => {
  try {
    // const orders = await orderModel.find({ userId: req.params.id });
    const orders = [];
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};

// ==============================================================================================================================
// SELLERS SECTION
//

// GET /api/admin/sellers ==== Get users ====

export const getAllSellers = async (req, res) => {
  try {
    const sellers = await sellerModel
      .find({})
      .select("-password")
      .sort({ createdAt: -1 });

    // count books per seller
    const sellerIds = sellers.map((s) => s._id);

    const counts = await bookModel.aggregate([
      { $match: { sellerId: { $in: sellerIds } } },
      {
        $group: {
          _id: "$sellerId",
          totalBooks: { $sum: 1 },
        },
      },
    ]); 

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.totalBooks;
    });

    const shaped = sellers.map((s) => ({
      ...s.toObject(),
      totalBooks: countMap[s._id.toString()] || 0,
    }));

    res.json({ sellers: shaped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load sellers" });
  }
};


// POST /api/admin/sellers  ==== Create Sellers ====
export const createSeller = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await sellerModel.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const seller = await sellerModel.create({ name, email, password });
    res.status(201).json({
      message: "Seller created",
      seller: { _id: seller._id, name: seller.name, email: seller.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create seller" });
  }
};

// PATCH /api/admin/sellers/:id  ==== update seller ====
export const updateSeller = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const seller = await sellerModel
      .findByIdAndUpdate(req.params.id, updates, { new: true })
      .select("-password");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({ message: "Seller updated", seller });
  } catch (err) {
    console.error("updateSeller error:", err);
    res.status(500).json({ message: "Failed to update seller" });
  }
};


// DELETE /api/admin/sellers/:id  ==== delete seller ====
export const deleteSeller = async (req, res) => {
  try {
    const user = await sellerModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
 
// GET /api/admin/sellers/:id/books  ==== view seller's books ====
export const getSellerBooks = async (req, res) => {
  try {
    const sellerId = req.params.id;
    
    const books = await bookModel.find({ sellerId })
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    res.json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load seller books" });
  }
};


//========================================================================================

//
// BOOKS SECTION
//

// GET /api/admin/books   
export const getAllBooks = async (req, res) => {
  try {
    const { sellerId, sellerIds } = req.query;

    const filter = {};

    if (sellerId) {
      filter.sellerId = sellerId;
    } else if (sellerIds) {
      // multi-select filter popup (?sellerIds=id1,id2)
      const ids = sellerIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      filter.sellerId = { $in: ids };
    } 

    const books = await bookModel
      .find(filter)
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    const shaped = books.map((b) => ({
      ...b.toObject(),
      sellerName: b.sellerName || b.sellerId?.name || "",
    }));

    res.json({ books: shaped });
  } catch (err) {
    console.error("getAllBooks error:", err);
    res.status(500).json({ message: "Failed to load books" });
  }
};




// PATCH /api/admin/books/:id/stock
export const updateBookStock = async (req, res) => {
  try {
    const { status } = req.body; // "IN_STOCK" | "OUT_OF_STOCK"
    const book = await bookModel.findByIdAndUpdate(
      req.params.id,
      { stockStatus: status },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Stock updated", book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update stock" });
  }
};

// DELETE /api/admin/books/:id
export const deleteBook = async (req, res) => {
  try {
    const book = await bookModel.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete book" });
  }
};
