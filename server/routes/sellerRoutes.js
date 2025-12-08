// routes/sellerRoutes.js
import express from "express";
import {
  createBook,
  getSellerBooks,
  updateSellerBook,
  toggleBookStock,
  deleteBook,
  getSellerOrders,
  getSellerBookById,
  upload,
  updateBookImage,
  updateSellerOrderStatus,
  getSellerStats,
} from "../controllers/SellerControllers.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// protect all seller routes
router.use(requireAuth(["SELLER"]));

router.post("/books",requireAuth(["SELLER"]), upload.single("itemImage"), createBook);
router.get("/books", requireAuth(["SELLER"]), getSellerBooks);
router.patch("/books/:id/stock", requireAuth(["SELLER"]), toggleBookStock);
router.patch("/books/:id", requireAuth(["SELLER"]), updateSellerBook);
router.get("/books/:id", getSellerBookById); 




router.delete("/books/:id",requireAuth(["SELLER"]), deleteBook);
router.get("/orders",requireAuth(["SELLER"]), getSellerOrders);
router.patch("/orders/:id/status",requireAuth(["SELLER"]), updateSellerOrderStatus);  

router.get("/stats",requireAuth(["SELLER"]), getSellerStats); 



export default router;
