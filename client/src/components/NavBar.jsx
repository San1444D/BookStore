// NavBar.jsx - simpler autocomplete version
import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NavBar = () => {
  const {
    setShowLogin,
    user,
    token,
    logout,
    cartCount,
    wishlistCount,
    backendUrl,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const isLoggedIn = !!token;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const fetchBooks = async (query) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}api/user/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(data.slice(0, 5));
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Live search on query change
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length > 1) {
      fetchBooks(q);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Full search page (used mainly on mobile Enter)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/books?search=${encodeURIComponent(q)}`);
    setShowResults(false);
  };

  const selectBook = (bookId) => {
    navigate(`/books/${bookId}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const renderResults = () =>
    showResults &&
    searchResults.length > 0 && (
      <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl z-50 mt-2! max-h-80 overflow-y-auto">
        {searchResults.map((book) => (
          <button
            type="button"
            key={book._id}
            onClick={() => selectBook(book._id)}
            className="w-full text-left p-4! hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex gap-3 items-center transition-all"
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm leading-tight">
                {book.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-1 mt-0.5!">
                by {book.author}
              </p>
            </div>
          </button>
        ))}
      </div>
    );

  return (
    <nav className="h-20 bg-transparent flex items-center justify-between px-4! md:px-6! lg:px-12! relative z-50">
      {/* Logo */}
      <h1
        className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-btn cursor-pointer shrink-0"
        onClick={() => {
          navigate("/");
          setShowResults(false);
        }}
      >
        Book
      </h1>

      {/* Desktop Menu (lg+) */}
      <ul className="hidden lg:flex items-center gap-6">
        {/* Desktop Search with Results */}
        <li className="relative">
          <form
            onSubmit={(e) => e.preventDefault()} // desktop: no Enter submit
            className="bg-white/80 backdrop-blur-md border border-gray-300 rounded-full px-4! py-1.5! w-60"
          >
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </form>
          {renderResults()}
        </li>

        {/* Orders */}
        <li>
          <button
            onClick={() => navigate("/orders")}
            className="px-5! py-1.5! bg-primary-btn text-white cursor-pointer rounded-full text-sm font-semibold hover:shadow-lg transition-all"
          >
            Orders
          </button>
        </li>

        {/* Wishlist */}
        <li className="relative p-1 hover:bg-white/50 rounded-full">
          <button onClick={() => navigate("/wishlist")}>
            <img
              src={assets.favorite_icon}
              alt="wishlist"
              className="h-6 hover:scale-110 transition cursor-pointer"
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1! rounded-full cursor-pointer bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>
        </li>

        {/* Cart */}
        <li className="relative p-1 hover:bg-white/50 rounded-full">
          <button onClick={() => navigate("/cart")}>
            <img
              src={assets.shopping_bag}
              alt="cart"
              className="h-6 hover:scale-110 transition cursor-pointer"
            />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1! rounded-full cursor-pointer bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </li>

        {isLoggedIn ? (
          <>
            <li className="text-sm font-semibold text-gray-700 hidden xl:block">
              <button
              onClick={() => navigate("/profile")}
              className="px-5! py-1.5! bg-primary-btn text-white cursor-pointer rounded-full text-sm font-semibold hover:shadow-lg transition-all">
                <p>Hi, {user?.name?.split(" ")[0]}</p>
              </button>
            </li>
            <li>
              <button
                onClick={logout}
                className="bg-zinc-900 hover:bg-primary-btn text-white font-semibold px-5! py-1.5! rounded-full cursor-pointer text-sm transition-all"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-zinc-900 hover:bg-primary-btn text-white font-semibold px-5! py-1.5! rounded-full cursor-pointer text-sm transition-all"
            >
              Login
            </button>
          </li>
        )}
      </ul>

      {/* Mobile + Tablet Layout: Search + Hamburger */}
      <div className="flex items-center gap-3 lg:hidden w-full max-w-md ml-4!">
        {/* Mobile/Tablet Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10! pr-4! py-2.5! border border-gray-300 rounded-full text-sm outline-none bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-primary-btn focus:border-transparent transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Mobile Search Results */}
          {renderResults()}
        </form>

        {/* Hamburger */}
        <button
          onClick={toggleMobileMenu}
          className="flex flex-col justify-center items-center w-10 h-10 p-1! ml-auto! shrink-0"
          aria-label="Toggle menu"
        >
          <img
            src={assets.menu_icon}
            alt="menu"
            className={`h-6 w-6 transition-transform duration-300 ${
              isMobileMenuOpen ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile/Tablet Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed right-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 lg:hidden overflow-y-auto">
            <div className="p-4! border-b border-gray-200 sticky top-0 bg-white z-10 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Quick Actions</h3>
              <button
                onClick={toggleMobileMenu}
                className="p-2! hover:bg-gray-200 rounded-full transition-all"
              >
                <img src={assets.close_icon} alt="close" className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4! space-y-3!">
              <button
                onClick={() => {
                  navigate("/orders");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-3! bg-primary-btn/10 hover:bg-primary-btn/20 rounded-full font-semibold text-left transition-all"
              >
                Orders
              </button>
              <button
                onClick={() => {
                  navigate("/wishlist");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3! bg-linear-to-r from-pink-100 to-red-100 hover:from-pink-200 hover:to-red-200 rounded-full font-semibold transition-all"
              >
                <img
                  src={assets.favorite_icon}
                  alt="wishlist"
                  className="h-5 w-5"
                />
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </button>
              <button
                onClick={() => {
                  navigate("/cart");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3! bg-linear-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 rounded-full font-semibold transition-all"
              >
                <img src={assets.shopping_bag} alt="cart" className="h-5 w-5" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-4! bg-linear-to-r from-zinc-800 to-zinc-900 text-white font-semibold rounded-full hover:shadow-xl transition-all"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-4! bg-linear-to-r from-zinc-800 to-zinc-900 text-white font-semibold rounded-full hover:shadow-xl transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;
