import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {

  getMyProfile,
  updateMyProfile,

  getUserBooks,
  getUserBookById,
  getTopBooks,
  getBookReviews,
  addBookReview,

  searchBooks,

  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,

  getWishlist,
  addToWishlist,
  removeFromWishlist,

  createOrderFromCart,
  getMyOrders,
  buyNowOrder,
  getMyOrderById,
  cancelMyOrder,
} from "../controllers/UsersControllers.js";

const router = express.Router();

// router.use(requireAuth(["USER"]));


// profile
router.get("/profile", requireAuth(["USER"]), getMyProfile);
router.put("/profile", requireAuth(["USER"]), updateMyProfile);

// books
router.get("/books", getUserBooks);
router.get("/books/:id", getUserBookById);
router.get("/top-books", getTopBooks);

// search
router.get("/search", searchBooks); 

// reviews
router.get("/books/:id/reviews", getBookReviews);
router.post("/books/:id/reviews", requireAuth(["USER"]), addBookReview);

// cart
router.get("/cart", requireAuth(["USER"]), getCart);
router.post("/cart", requireAuth(["USER"]), addToCart);
router.patch("/cart/:bookId", requireAuth(["USER"]), updateCartItem);
router.delete("/cart", requireAuth(["USER"]), clearCart); // empty full cart
router.delete("/cart/:bookId", requireAuth(["USER"]), removeCartItem); // delete item in cart

// wishlist
router.get("/wishlist", requireAuth(["USER"]), getWishlist);
router.post("/wishlist", requireAuth(["USER"]), addToWishlist);
router.delete("/wishlist/:bookId", requireAuth(["USER"]), removeFromWishlist);

// orders

router.post("/orders/from-cart", requireAuth(["USER"]), createOrderFromCart);
router.post("/orders/buy-now/:bookId", requireAuth(["USER"]), buyNowOrder);
router.get("/orders", requireAuth(["USER"]), getMyOrders);
router.get("/orders/:orderId", requireAuth(["USER"]), getMyOrderById);
router.patch("/orders/:orderId/cancel", requireAuth(["USER"]), cancelMyOrder);

export default router;
