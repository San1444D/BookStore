// pages/User/UWishlist.jsx - Complete version
import React, { useEffect, useState, useContext } from "react";
import NavBar from "../../components/NavBar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { getBookImage } from "../../utils/imageHelper";

const UWishlist = () => {
  const {
    wishlistItems,
    setWishlistItems,
    wishlistCount,
    setWishlistCount,
    token,
    backendUrl,
    fetchWishlistCount,
    fetchCartCount,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [token, backendUrl]);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}api/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = data.items || data || [];
      setWishlistItems(items);
      setWishlistCount(items.length);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      await axios.delete(`${backendUrl}api/user/wishlist/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = wishlistItems.filter(
        (item) => (item._id || item.bookId) !== bookId
      );
      setWishlistItems(updated);
      setWishlistCount(updated.length);
      fetchWishlistCount(); // Update NavBar badge
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("Remove error:", err);
      toast.error("Failed to remove");
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

  if (loading) {
    return (
      <section className="min-h-screen bg-primary-home">
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12! px-4!">
          <div className="text-lg text-gray-600 animate-pulse">
            Loading wishlist...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-primary-home">
      <NavBar />
      <section className="py-12! px-4! md:px-8! ">
        <div className="max-w-7xl! mx-auto!">
          <div className="flex justify-between items-center mb-8!">
            <h1 className="text-3xl font-semibold text-primary-btn">
              My Wishlist ({wishlistCount})
            </h1>
            {wishlistItems.length > 0 && (
              <button
                onClick={fetchWishlist}
                className="px-6! py-2.5! hover:bg-primary-btn bg-red-500 text-white rounded-full text-sm font-medium cursor-pointer"
              >
                Refresh
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center! py-20! bg-white! rounded-3xl! shadow-lg! p-12!">
              <div className="w-24! h-24! bg-gray-100! rounded-3xl! mx-auto! mb-6! flex! items-center! justify-center!">
                <svg
                  className="w-12! h-12! text-gray-400!"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 3h18l-2 12H5L3 3zm0 0v0m0 0V3v0m0 0L5 5m0 0L3 3m2 2l-2-2"
                  />
                </svg>
              </div>
              <p className="text-xl! text-gray-500! mb-4! font-medium!">
                Your wishlist is empty
              </p>
              <p className="text-gray-600! mb-8!">
                Save books you like for later
              </p>
              <a
                href="/books"
                className="inline-block! px-8! py-3.5! bg-primary-btn text-white! font-semibold! rounded-2xl! cursor-pointer transition-colors! shadow-lg! hover:shadow-xl!"
              >
                Browse Books
              </a>
            </div>
          ) : (
            // Replace the grid section in UWishlist.jsx (lines ~110-200)
            <div className="grid grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-5!">
              {wishlistItems.map((item) => {
                const id = item._id || item.bookId;
                return (
                  <div
                    key={id}
                    className="bg-white! rounded-xl! shadow-md! hover:shadow-lg! transition-all! p-5! border! border-gray-100!"
                  >
                    <div className="flex! gap-4!">
                      {/* Compact Image */}
                      <div className="relative! shrink-0!">
                        <img
                          src={getBookImage(item.itemImage)}
                          alt={item.title}
                          className="w-20! h-28! object-cover! rounded-lg! shadow-sm!"
                        />
                        <button
                          onClick={() => removeFromWishlist(id)}
                          className="absolute! -top-2! -right-2! p-1.5! bg-red-500! cursor-pointer text-white! rounded-full! shadow-lg! hover:bg-red-600! transition-all!"
                          title="Remove"
                        >
                          <svg
                            className="w-4! h-4!"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1! min-w-0!">
                        <h3 className="font-semibold! text-base! text-gray-900! line-clamp-2! mb-1! leading-tight!">
                          {item.title}
                        </h3>
                        <p className="text-sm! text-gray-600! mb-3! line-clamp-1!">
                          by {item.author}
                        </p>

                        <div className="flex! items-center! justify-between! mb-4!">
                          <span className="text-xl! font-bold! text-primary-btn!">
                            ₹{item.price}
                          </span>
                        </div>

                        <div className="space-y-2!">
                          <button
                            onClick={() => handleAddToCart(item.bookId || id)}
                            className="w-full! py-2.5! px-4! bg-primary-btn! text-white! font-medium! rounded-lg! hover:bg-primary-btn/90! transition-all! text-sm! cursor-pointer"
                          >
                            Add to Cart
                          </button>
                          <a
                            href={`/books/${item.bookId || id}`}
                            className="w-full! py-2! px-4! block! text-center! text-xs! font-medium! text-gray-700! border! border-gray-300! rounded-lg! hover:bg-gray-50! hover:border-primary-btn! transition-all!"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default UWishlist;
