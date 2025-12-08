// routes/adminRoutes.js
import express from "express";
import {
  getAdminStats,

  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserOrders,

  getAllSellers,
  createSeller,
  updateSeller,
  getSellerBooks,
  deleteSeller,
  
  getAllBooks,
  updateBookStock,
  deleteBook,
} from "../controllers/AdminControllers.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// all admin routes are protected
router.use(requireAuth(["ADMIN"]));
router.get("/stats", getAdminStats);

// USERS
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users/:id/orders", getUserOrders);

// SELLERS
router.get("/sellers", getAllSellers);
router.post("/sellers",createSeller);
router.patch("/sellers/:id", updateSeller); 
router.delete("/sellers/:id", deleteSeller);
router.get("/sellers/:id/books",getSellerBooks);
// add more: block / approve etc.

// BOOKS
router.get("/books", getAllBooks);
router.patch("/books/:id/stock", updateBookStock);
router.delete("/books/:id", deleteBook);

export default router;
