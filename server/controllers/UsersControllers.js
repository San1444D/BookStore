import mongoose from "mongoose";
import bookModel from "../models/Seller/BookSchema.js";
import reviewModel from "../models/Users/ReviewSchema.js";
import cartModel from "../models/Users/CartSchema..js";
import wishlistModel from "../models/Users/WishlistSchema.js";
import OrderModel from "../models/Users/OrderSchema.js";
import userModel from "../models/Users/UserSchema.js";


// ========================================= PROFILE =================================================


// GET /api/user/profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId)
      .select("name email phone addressFlatno addressPincode addressCity addressState")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// PUT /api/user/profile
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, phone, flatno, pincode, city, state } = req.body;

    const updated = await userModel.findByIdAndUpdate(
      userId,
      {
        ...(email && { email }),
        ...(phone && { phone }),
        ...(flatno && { addressFlatno: flatno }),
        ...(pincode && { addressPincode: pincode }),
        ...(city && { addressCity: city }),
        ...(state && { addressState: state }),
      },
      { new: true, runValidators: true }
    )
      .select("name email phone addressFlatno addressPincode addressCity addressState")
      .lean();

    res.json(updated);
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};



// ========================================= BOOKS =================================================

// get list of books for book list page
export const getUserBooks = async (req, res) => {
  try {
    const { genre } = req.query;

    const filter = { stockStatus: "IN_STOCK" }; // optional
    if (genre) {
      // genres is an array on each book
      filter.genres = genre; // or { $in: [genre] } if needed
    }

    const books = await bookModel.find(filter).sort({ createdAt: -1 });

    res.json({ books });
  } catch (err) {
    console.error("getUserBooks error:", err);
    res.status(500).json({ message: "Failed to load books" });
  }
};

// get book details for view book page
export const getUserBookById = async (req, res) => {
  try {
    const book = await bookModel.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ book });
  } catch (err) {
    console.error("getUserBookById error:", err);
    res.status(500).json({ message: "Failed to load book" });
  }
};

// GET /api/user/top-rated books
export const getTopBooks = async (req, res) => {
  try {
    // if reviews exist, use them; else fallback
    const reviewAgg = await reviewModel.aggregate([
      {
        $group: {
          _id: "$bookId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 8 },
    ]);

    let books;

    if (reviewAgg.length > 0) {
      const ids = reviewAgg.map((r) => r._id);
      const booksMap = await bookModel.find({ _id: { $in: ids } }).lean();

      const byId = Object.fromEntries(
        booksMap.map((b) => [b._id.toString(), b])
      );

      books = reviewAgg
        .map((r) => {
          const b = byId[r._id.toString()];
          if (!b) return null;
          return {
            ...b,
            avgRating: r.avgRating,
            reviewCount: r.count,
          };
        })
        .filter(Boolean);
    } else {
      books = await bookModel.find().sort({ createdAt: -1 }).limit(8).lean();
    }

    res.json({ books });
  } catch (err) {
    console.error("getTopBooks error:", err);
    res.status(500).json({ message: "Failed to load top books" });
  }
};

// ========================================= REVIEW =================================================

export const getBookReviews = async (req, res) => {
  try {
    
    const { id } = req.params; // bookId

    const [agg] = await reviewModel.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$bookId",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const reviews = await reviewModel
      .find({ bookId: id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      reviews,
      avgRating: agg?.avgRating || 0,
      reviewCount: agg?.reviewCount || 0,
    });
  } catch (err) {
    console.error("getBookReviews error:", err);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

export const addBookReview = async (req, res) => {
  try {
    const { id } = req.params; // bookId
    const { rating, title, text } = req.body;

    const userId = req.user.id; // from JWT payload
    const userName = req.user.name;

    const review = await reviewModel.create({
      bookId: id,
      userId,
      userName,
      rating,
      title,
      text,
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error("addBookReview error:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
};





// ========================================= CART =================================================
// GET /api/user/cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartModel.findOne({ userId }).lean();
    res.json({ items: cart?.items || [] });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ message: "Failed to load cart" });
  }
};

// POST /api/user/cart  { bookId, quantity? }
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity = 1 } = req.body;
    
    const book = await bookModel.findById(bookId).lean();
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    let cart = await cartModel.findOne({ userId });
    
    if (!cart) {
      cart = await cartModel.create({
        userId,
        items: [
          {
            bookId: book._id,
            title: book.title,
            author: book.author,
            itemImage: book.itemImage,
            price: book.price,
            quantity,
          },
        ],
      });
    } else {
      const existing = cart.items.find(
        (it) => it.bookId.toString() === bookId
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({
          bookId: book._id,
          title: book.title,
          author: book.author,
          itemImage: book.itemImage,
          price: book.price,
          quantity,
        });
      }
      await cart.save();
    }
    
    res.status(200).json({ message: "Added to cart" });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// PATCH /api/user/cart/:bookId  { quantity }
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be >= 1" });
    }
    
    const cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    
    const item = cart.items.find(
      (it) => it.bookId.toString() === bookId
    );
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }
    
    item.quantity = quantity;
    await cart.save();
    
    res.json({ message: "Cart updated" });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
};

// DELETE /api/user/cart/:bookId
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    
    const cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    
    cart.items = cart.items.filter(
      (it) => it.bookId.toString() !== bookId
    );
    await cart.save();
    
    res.json({ message: "Item removed" });
  } catch (err) {
    console.error("removeCartItem error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
};
// Clear Cart items /api/user/cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await cartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};





// ========================================= WISHLIST =================================================

// GET /api/user/wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wl = await wishlistModel.findOne({ userId }).lean();
    res.json({ items: wl?.items || [] });
  } catch (err) {
    console.error("getWishlist error:", err);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
};

// POST /api/user/wishlist  { bookId }
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    const book = await bookModel.findById(bookId).lean();
    if (!book) return res.status(404).json({ message: "Book not found" });

    let wl = await wishlistModel.findOne({ userId });

    if (!wl) {
      wl = await wishlistModel.create({
        userId,
        items: [
          {
            bookId: book._id,
            title: book.title,
            author: book.author,
            itemImage: book.itemImage,
            price: book.price,
          },
        ],
      });
    } else {
      const exists = wl.items.some((it) => it.bookId.toString() === bookId);
      if (!exists) {
        wl.items.push({
          bookId: book._id,
          title: book.title,
          author: book.author,
          itemImage: book.itemImage,
          price: book.price,
        });
        await wl.save();
      }
    }

    res.json({ message: "Added to wishlist" });
  } catch (err) {
    console.error("addToWishlist error:", err);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
};

// DELETE /api/user/wishlist/:bookId
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const wl = await wishlistModel.findOne({ userId });
    if (!wl) return res.status(404).json({ message: "Wishlist not found" });

    wl.items = wl.items.filter((it) => it.bookId.toString() !== bookId);
    await wl.save();

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
};


// ========================================= SEARCH =================================================


export const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const searchQuery = q.trim();
    
    const books = await bookModel.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { author: { $regex: searchQuery, $options: 'i' } },
      ]
    })
    .select('_id title author price coverImage images[0] genre')
    .limit(8)
    .sort({ title: 1 })
    .lean();

    res.json(books);
  } catch (error) {
    console.error('🔍 Search error:', error);
    res.status(500).json([]);
  }
};

// ========================================= ORDERS =================================================




// createOrderFromCart

export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) get cart
    const cart = await cartModel.findOne({ userId }).lean();
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2) get default address from profile
    const user = await userModel.findById(userId)
      .select("addressFlatno addressPincode addressCity addressState")
      .lean();

    if (!user || !user.addressPincode) {
      return res
        .status(400)
        .json({ message: "Please set your address in profile first" });
    }

    const flatno = user.addressFlatno;
    const pincode = user.addressPincode;
    const city = user.addressCity;
    const state = user.addressState;

    // 3) seller from first cart item
    const firstBook = await bookModel
      .findById(cart.items[0].bookId)
      .select("sellerId")
      .lean();
    if (!firstBook) {
      return res.status(400).json({ message: "Invalid cart items" });
    }

    // 4) build items snapshot
    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        const book = await bookModel
          .findById(item.bookId)
          .select("title price")
          .lean();
        if (!book) return null;
        const quantity = item.quantity || 1;
        const price = item.price ?? book.price;
        const subtotal = price * quantity;
        return {
          bookId: item.bookId,
          title: book.title,
          price,
          quantity,
          subtotal,
        };
      })
    );

    const filteredItems = orderItems.filter(Boolean);
    if (!filteredItems.length) {
      return res.status(400).json({ message: "No valid books in cart" });
    }

    const totalAmount = filteredItems.reduce((sum, it) => sum + it.subtotal, 0);

    // 5) create order
    const newOrder = await OrderModel.create({
      userId,
      sellerId: firstBook.sellerId,
      flatno,
      pincode,
      city,
      state,
      items: filteredItems,
      totalAmount,
    });

    // 6) clear cart
    await cartModel.updateOne({ userId }, { $set: { items: [] } });

    return res.status(201).json(newOrder);
  } catch (err) {
    console.error("createOrderFromCart error:", err);
    return res.status(500).json({ message: "Failed to place order" });
  }
};





// GET /api/user/orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;  // FIX
    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};



// POST /api/user/orders/buy-now/:bookId
export const buyNowOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    const { quantity = 1 } = req.body;

    // 1) book
    const book = await bookModel
      .findById(bookId)
      .select("title price sellerId")
      .lean();
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 2) user address from profile
    const user = await userModel.findById(userId)
      .select("addressFlatno addressPincode addressCity addressState")
      .lean();

    if (!user || !user.addressPincode) {
      return res
        .status(400)
        .json({ message: "Please set your address in profile first" });
    }

    const flatno = user.addressFlatno;
    const pincode = user.addressPincode;
    const city = user.addressCity;
    const state = user.addressState;

    // 3) amounts
    const qty = Number(quantity) || 1;
    const subtotal = book.price * qty;

    const order = await OrderModel.create({
      userId,
      sellerId: book.sellerId,
      flatno,
      pincode,
      city,
      state,
      items: [
        {
          bookId,
          title: book.title,
          price: book.price,
          quantity: qty,
          subtotal,
        },
      ],
      totalAmount: subtotal,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("buyNowOrder error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
};



// get specific order's details 
// GET /api/user/orders/:orderId
export const getMyOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await OrderModel.findOne({ _id: orderId, userId }).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("getMyOrderById error:", err);
    res.status(500).json({ message: "Failed to load order details" });
  }
};


// PATCH /api/user/orders/:orderId/cancel
export const cancelMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // allow cancel only before shipped/delivered
    if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "This order can no longer be cancelled" });
    }

    order.status = "CANCELLED";
    await order.save();

    res.json({ message: "Order cancelled", order });
  } catch (err) {
    console.error("cancelMyOrder error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};





