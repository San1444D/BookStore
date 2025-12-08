// pages/User/UBookList.jsx
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext, useMemo } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import NavBar from "../../components/NavBar.jsx";
import { getBookImage } from "../../utils/imageHelper.js";

const UBookList = () => {
  const { backendUrl } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialGenre = searchParams.get("genre") || "";
  const [genre, setGenre] = useState(initialGenre);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState("default"); // price,name,rating
  const [sortDir, setSortDir] = useState("asc"); // asc | desc
  const [pageSize, setPageSize] = useState(15);

  const [page, setPage] = useState(1);

  const loadBooks = async () => {
    try {
      setLoading(true);
      let url = `${backendUrl}api/user/books`;
      const params = new URLSearchParams();
      if (genre) params.append("genre", genre);
      // backend can optionally support sort/page later
      const query = params.toString();
      if (query) url += `?${query}`;

      const { data } = await axios.get(url);
      setBooks(data.books || []);
      setPage(1);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setGenre(initialGenre);
  }, [initialGenre]);

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre]);

  // client-side sort + pagination
  const sortedBooks = useMemo(() => {
    const arr = [...books];

    arr.sort((a, b) => {
      let v1, v2;

      switch (sortBy) {
        case "price":
          v1 = Number(a.price) || 0;
          v2 = Number(b.price) || 0;
          break;
        case "name":
          v1 = (a.title || "").toLowerCase();
          v2 = (b.title || "").toLowerCase();
          break;
        case "rating":
          v1 = Number(a.avgRating || 0);
          v2 = Number(b.avgRating || 0);
          break;
        default:
          return 0;
      }

      if (v1 < v2) return sortDir === "asc" ? -1 : 1;
      if (v1 > v2) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [books, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageBooks = sortedBooks.slice(start, start + pageSize);

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleDirToggle = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setPage(1);
  };

  return (
    <section className="min-h-screen bg-primary-home">
      <NavBar />

      <div className="max-w-[90%] mx-auto! border border-gray-50 shadow-xl bg-white rounded-2xl mt-8! pt-8! px-6! md:px-10! pb-12!">
        {/* Header + controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4! mb-6!">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-primary-btn mb-1!">
              {genre ? `Books in ${genre}` : "All Books"}
            </h1>
            <p className="text-sm text-gray-600">
              Showing {sortedBooks.length} book{sortedBooks.length !== 1 && "s"}
              {genre && ` under "${genre}"`}
            </p>
          </div>

          {/* Filters bar */}
          <div className="flex flex-wrap gap-3! items-center">
            {/* Sort by */}
            <div className="flex items-center gap-2!">
              <span className="text-xs text-gray-600">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3! py-1.5! border border-gray-300 rounded-full text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-btn"
              >
                <option value="default">Default</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>

              <button
                onClick={handleDirToggle}
                className="px-3! py-1.5! border border-gray-300 rounded-full text-xs bg-white hover:bg-gray-100"
                title="Toggle ascending / descending"
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </button>
            </div>

            {/* Page size */}
            <div className="flex items-center gap-2!">
              <span className="text-xs text-gray-600">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="px-3! py-1.5! border border-gray-300 rounded-full text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-btn"
              >
                <option value={12}>12</option>
                <option value={15}>15</option>
                <option value={24}>24</option>
                <option value={36}>36</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books grid */}
        {loading ? (
          <div className="py-16! text-center text-gray-500">
            Loading books...
          </div>
        ) : pageBooks.length === 0 ? (
          <div className="py-16! text-center text-gray-500">
            No books found for this selection.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8! gap-y-10!">
            {pageBooks.map((book) => (
              <article
                key={book._id}
                className="flex flex-col items-center text-center"
              >
                {/* cover */}
                <div
                  onClick={() => navigate(`/books/${book._id}`)}
                  className="w-40! h-56! bg-white rounded shadow-md flex items-center justify-center mb-3! cursor-pointer hover:shadow-lg transition"
                >
                  <img
                    src={getBookImage(book.itemImage)}
                    alt={book.title}
                    className="max-h-[90%] object-contain"
                    loading="lazy"
                  />
                </div>

                {/* title */}
                <h3 className="text-sm font-semibold line-clamp-2 mb-1!">
                  {book.title}
                </h3>

                {/* author */}
                <p className="text-xs text-gray-500 mb-1!">
                  {book.author || "Unknown"}
                </p>

                {/* price + rating */}
                <div className="flex items-center justify-center gap-2! mb-1!">
                  <span className="text-sm font-bold text-primary-btn">
                    ₹{Number(book.price).toLocaleString()}
                  </span>
                  {book.avgRating && (
                    <span className="text-xs text-yellow-500">
                      ★ {book.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination footer */}
        {!loading && sortedBooks.length > 0 && (
          <div className="mt-10! flex justify-between items-center text-xs text-gray-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2!">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3! py-1.5! rounded-full border border-gray-300 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3! py-1.5! rounded-full border border-gray-300 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UBookList;
