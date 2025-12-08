// components/TopRatedSection.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { getBookImage } from "../utils/imageHelper";
import { toast } from "react-toastify";

const Card = ({ b, onView, onAddToCart }) => (
  <article className="w-[230px] bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden shrink-0 cursor-pointer hover:shadow-lg transition">
    <div
      onClick={onView}
      className="bg-primary-home/40 flex justify-center items-center pt-5! pb-4!"
    >
      <img
        src={getBookImage(b.itemImage)}
        alt={b.title}
        className="h-32! object-contain drop-shadow-md"
      />
    </div>
    <div className="px-4! py-2! text-primary-btn text-sm font-semibold">
      ₹{Number(b.price).toFixed(2)}
    </div>
    <div className="px-4! pb-4! flex flex-col gap-1.5! text-sm">
      <h3 className="font-semibold line-clamp-2">{b.title}</h3>
      <p className="text-xs text-blue-600 font-medium">
        {b.author || "Unknown"}
      </p>
      <div className="flex items-center gap-1! mt-1!">
        <span className="text-yellow-400 text-sm">★★★★★</span>
        <span className="text-xs text-gray-500">
          {b.avgRating ? b.avgRating.toFixed(1) : "4.5"} •{" "}
          {b.reviewCount ? `${b.reviewCount}+` : "50+"} reviews
        </span>
      </div>
    </div>
    <button
      onClick={onAddToCart}
      className="w-full bg-black text-white text-xs font-semibold py-2.5! flex items-center justify-center gap-2! hover:bg-primary-btn transition cursor-pointer"
    >
      <span>🛒</span>
      <span>Add To Cart</span>
    </button>
  </article>
);

const TopRatedSection = () => {
  const { backendUrl, token, fetchCartCount } = useContext(AppContext);
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}api/user/top-books`);
        setBooks(data.books || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [backendUrl]);

  if (!books.length) return null;

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

  const loop = [...books, ...books, ...books, ...books];

  return (
    <section className="bg-primary-home py-12! px-6! md:px-12!">
      <div className="max-w-7xl mx-auto!">
        <h2 className="text-xl md:text-3xl text-primary-btn font-semibold text-center mb-16!">
          Top Rated Books
        </h2>

        <div className="marquee">
          <div className="marquee__track">
            {loop.map((b, i) => (
              <div key={`${b._id}-${i}`} className="mr-4! last:mr-0!">
                <Card
                  b={b}
                  onView={() => navigate(`/books/${b._id}`)}
                  onAddToCart={() => handleAddToCart(b._id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopRatedSection;
