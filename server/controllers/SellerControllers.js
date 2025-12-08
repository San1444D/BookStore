// controllers/SellerController.js
import bookModel from "../models/Seller/BookSchema.js";
import sellerModel from "../models/Seller/SellerSchema.js";
import orderModel from "../models/Users/OrderSchema.js";

import path from "path";

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config (add to your .env)
// CLOUDINARY_CLOUD_NAME=...
// CLOUDINARY_API_KEY=...
// CLOUDINARY_API_SECRET=...

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// POST /api/seller/books -  ==== create book ====
// controllers/SellerController.js

export const createBook = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);

    const sellerId = req.user.id;
    const seller = await sellerModel.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const { title, author, genres, price, description } = req.body;

    let itemImageUrl = null;
    if (req.file) {
      // FIXED: Proper upload_stream with promise
      itemImageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: `bookstore/sellers/${sellerId}` },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          )
          .end(req.file.buffer);
      });
    }

    const book = await bookModel.create({
      title,
      author,
      genres: JSON.parse(genres),
      price: Number(price),
      description: description || "",
      itemImage: itemImageUrl,
      sellerId,
      sellerName: seller.name,
      stockStatus: "IN_STOCK",
      stockCount: 10,
    });

    res.status(201).json({
      message: "Book created successfully",
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        genres: book.genres,
      },
    });
  } catch (err) {
    console.error("CREATE BOOK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/seller/books -  ==== seller's own books ====
export const getSellerBooks = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const books = await bookModel
      .find({ sellerId })
      .sort({ createdAt: -1 })
      .select("-sellerId"); // don't send sellerId back
    res.json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load books" });
  }
};

// PATCH /api/seller/books/:id/stock - toggle stock
export const toggleBookStock = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { status } = req.body;

    const book = await bookModel.findOneAndUpdate(
      { _id: req.params.id, sellerId },
      {
        stockStatus: status,
        stockCount: status === "IN_STOCK" ? 10 : 0,
      },
      { new: true }
    );

    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or access denied" });
    }

    res.json({ message: "Stock updated", book });
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    res.status(500).json({ message: "Failed to update stock" });
  }
};

// DELETE /api/seller/books/:id
export const deleteBook = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const book = await bookModel.findOneAndDelete({
      _id: req.params.id,
      sellerId,
    });

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete book" });
  }
};



// PATCH /api/seller/books/:id
export const updateSellerBook = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const book = await bookModel.findOne({ _id: id, sellerId });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Update fields
    if (updates.title !== undefined) book.title = updates.title;
    if (updates.author !== undefined) book.author = updates.author;
    if (updates.price !== undefined) book.price = updates.price;
    if (updates.description !== undefined) book.description = updates.description;
    if (updates.pages !== undefined) book.pages = updates.pages;
    
    // Handle genres (string → array)
    if (updates.genres !== undefined) {
      book.genres = Array.isArray(updates.genres)
        ? updates.genres
        : updates.genres
            .split(",")
            .map(g => g.trim())
            .filter(Boolean);
    }
    
    // Cloudinary URL (full URL)
    if (updates.itemImage !== undefined) {
      book.itemImage = updates.itemImage;
    }

    await book.save();
    res.json({ book, message: "Book updated successfully" });
  } catch (err) {
    console.error("updateSellerBook error:", err);
    res.status(500).json({ message: "Failed to update book" });
  }
};




// controllers/SellerController.js

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await orderModel
      .find({ sellerId })
      .populate("userId", "name email phone")
      .populate("items.bookId", "title itemImage price")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      orders,
      total: await orderModel.countDocuments({ sellerId }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};


// controllers/SellerControllers.js
export const getSellerBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const book = await bookModel.findOne({ 
      _id: id, 
      sellerId 
    }).populate('sellerId', 'name storeName');

    if (!book) {
      return res.status(404).json({ message: "Book not found or access denied" });
    }

    res.json({ book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/SellerControllers.js
export const updateBookImage = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Find book
    const book = await bookModel.findOne({ _id: id, sellerId });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete old image if exists
    if (book.itemImage && fs.existsSync(`uploads/books/${book.itemImage}`)) {
      fs.unlinkSync(`uploads/books/${book.itemImage}`);
    }

    // Save new image filename
    book.itemImage = req.file.filename;
    await book.save();

    res.json({ 
      message: "Image updated", 
      imageName: req.file.filename,
      imageUrl: `/images/books/${req.file.filename}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Image upload failed" });
  }
};


// PATCH /api/seller/orders/:id/status - Update order status
export const updateSellerOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔍 Updating order ${id} to ${status}`);

    const order = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`✅ Order ${id} updated to ${status}`);
    
    res.json({ 
      message: `Status updated to ${status}`,
      orderId: id,
      status 
    });
  } catch (err) {
    console.error("❌ Order update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// SellerControllers.js - ADD THIS
export const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // 1) Count books for this seller
    const booksCount = await bookModel.countDocuments({ sellerId });

    // 2) Get this seller's book ids
    const sellerBookIds = await bookModel.find({ sellerId }).distinct("_id");

    // 3) Count orders that include ANY of this seller's books
    const ordersCount = await orderModel.countDocuments({
      "items.bookId": { $in: sellerBookIds },
    });

    // 4) (Optional) revenue only from these orders
    const revenueAgg = await orderModel.aggregate([
      {
        $match: {
          "items.bookId": { $in: sellerBookIds },
          status: "DELIVERED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    res.json({
      books: booksCount,
      orders: ordersCount,
      revenue,
    });
  } catch (err) {
    console.error("getSellerStats error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
};

