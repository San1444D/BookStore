// pages/User/UViewBook.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { getBookImage } from "../../utils/imageHelper";

const UViewBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const { backendUrl, token, fetchCartCount, fetchWishlistCount } =
    useContext(AppContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);

  // reviews + stats from backend
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // add-review modal/form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");

  const loadBook = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}api/user/books/${bookId}`);
      setBook(data.book);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}api/user/books/${bookId}/reviews`
      );
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setReviewCount(data.reviewCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBook();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to write a review");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write something about the book");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}api/user/books/${bookId}/reviews`,
        {
          rating: reviewRating,
          title: reviewTitle.trim(),
          text: reviewText.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Review added");
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewTitle("");
      setReviewText("");
      await loadReviews(); // refresh list + average
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add review");
    }
  };

  // handle add to cart
  const handleAddToCart = async (bookId) => {
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await axios.post(
        `${backendUrl}api/user/cart`,
        { bookId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart");
      fetchCartCount(); // update navbar badge
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  // handle wishlist toggle
  const handleToggleWishlist = async () => {
    if (!token) {
      toast.error("Please login to use wishlist");
      return;
    }
    try {
      await axios.post(
        `${backendUrl}api/user/wishlist`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to wishlist");
      fetchWishlistCount();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    }
  };

  // handle buy now
  const handleBuyNow = async () => {
    if (!token) {
      toast.error("Please login to place an order");
      return;
    }

    const ok = window.confirm(`Buy "${book.title}" now?`);
    if (!ok) return;

    try {
      const body = { quantity: 1 }; // address from profile on backend

      await axios.post(`${backendUrl}api/user/orders/buy-now/${bookId}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order placed successfully");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  if (loading || !book) {
    return (
      <section className="min-h-screen bg-primary-home">
        <NavBar />
        <div className="max-w-5xl mx-auto pt-16! px-6! text-center text-gray-500">
          Loading book...
        </div>
      </section>
    );
  }

  const price = Number(book.price) || 0;
  const rounded = Math.round(avgRating || 0);

  return (
    <section className="min-h-screen bg-primary-home">
      <NavBar />

      <div className="max-w-7xl mx-auto! pt-10! pb-16! px-6! mt-8! md:px-10!">
        {/* Top: image + main details */}
        <div className="flex flex-col md:flex-row gap-10!">
          {/* left: cover */}
          <div className="shrink-0 flex justify-center">
            <div className="w-60! h-80! bg-white rounded-lg shadow-md flex items-center justify-center">
              <img
                src={getBookImage(book.itemImage)}
                alt={book.title}
                className="max-h-[90%] object-contain"
              />
            </div>
          </div>

          {/* right: details */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2!">
              {book.title}
            </h1>
            <p className="text-sm text-gray-600 mb-3!">
              By{" "}
              <span className="text-primary-btn font-medium">
                {book.author || "Unknown author"}
              </span>
            </p>

            {/* price + rating */}
            <div className="flex items-end gap-3! mb-4!">
              <span className="text-2xl font-semibold text-primary-btn">
                ₹{price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">
                inclusive of all taxes
              </span>
            </div>

            <div className="flex items-center gap-3! mb-5!">
              <span className="text-yellow-500 text-sm">
                {"★".repeat(rounded)}
                {"☆".repeat(5 - rounded)}
              </span>
              <span className="text-xs text-gray-600">
                {avgRating ? avgRating.toFixed(1) : "No rating yet"}
                {reviewCount > 0 &&
                  ` • ${reviewCount} review${reviewCount > 1 ? "s" : ""}`}
              </span>
            </div>

            {/* actions */}
            <div className="flex flex-wrap gap-3! mb-6!">
              <button
                onClick={handleBuyNow}
                className="px-5! py-2.5! rounded-full bg-primary-btn text-white text-sm font-semibold hover:bg-blue-800 cursor-pointer"
              >
                Buy Now
              </button>
              <button
                onClick={() => handleAddToCart(book._id)}
                className="px-5! py-2.5! rounded-full border border-gray-800 text-sm font-semibold hover:bg-gray-900 hover:text-white cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className="px-4! py-2.5! rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                ♥ Wishlist
              </button>
            </div>

            {/* short about */}
            <div className="space-y-2! text-sm text-gray-700">
              <h2 className="font-semibold text-base">About the book</h2>
              <p className="leading-relaxed">
                {book.description ||
                  "Description will be available soon. This book has been added by one of our sellers."}
              </p>

              <div className="mt-3! grid grid-cols-2 md:grid-cols-3 gap-y-1.5! text-xs text-gray-600">
                <span>
                  <span className="font-semibold">Pages:</span>{" "}
                  {book.pages ?? "Not specified"}
                </span>

                <span>
                  <span className="font-semibold">Format:</span> Paperback
                </span>
                <span>
                  <span className="font-semibold">Language:</span> English
                </span>
                <span>
                  <span className="font-semibold">Genre:</span>{" "}
                  {book.genres?.join(", ") || "General"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10! border-t border-gray-200 pt-6!">
          <div className="flex items-center justify-between mb-4!">
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4! py-1.5! rounded-full border border-primary-btn text-xs text-primary-btn font-semibold hover:bg-primary-btn hover:text-white cursor-pointer"
            >
              + Add Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 mb-4!">
              No reviews yet. Be the first to review this book.
            </p>
          ) : (
            <p className="text-xs text-gray-500 mb-4!">
              Showing latest {reviews.length} review
              {reviews.length > 1 && "s"}.
            </p>
          )}

          <div className="space-y-4!">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-4! py-3!"
              >
                <div className="flex justify-between items-center mb-1.5!">
                  <div className="text-sm font-semibold">
                    {r.userName || "User"}
                  </div>
                  <div className="text-xs text-yellow-500">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                </div>
                <div className="text-xs text-gray-700 font-medium mb-1!">
                  {r.title}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add review modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleSubmitReview}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl px-6! py-5! space-y-4!"
          >
            <h4 className="text-base font-semibold">Write a review</h4>

            {/* Rating stars */}
            <div className="flex items-center gap-2!">
              <span className="text-xs text-gray-600">Your rating:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="mr-1! text-yellow-500 text-xl"
                  >
                    {star <= reviewRating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Short title (optional)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3! py-2! text-xs focus:outline-none focus:ring-1 focus:ring-primary-btn"
            />

            <textarea
              rows={4}
              placeholder="Share your experience with this book"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3! py-2! text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary-btn"
            />

            <div className="flex justify-end gap-2! pt-1!">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4! py-1.5! rounded-full border border-gray-300 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4! py-1.5! rounded-full bg-primary-btn text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default UViewBook;
