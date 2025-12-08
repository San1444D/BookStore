// SProduct.jsx
import React, { useEffect, useState, useContext } from "react";
import SNavBar from "../../components/SellerComponents/SNavBar.jsx";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { getBookImage } from "../../utils/imageHelper.js";

const SProduct = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}api/seller/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(data.books || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const filtered = books.filter((b) =>
    `${b.title} ${b.author || ""} ${b.genres?.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // const [pendingUpdates, setPendingUpdates] = useState({});

  const toggleStock = async (id) => {
    try {
      // 1. OPTIMISTIC UI (get CURRENT status before update)
      const currentBook = books.find((b) => b._id === id);
      const newStatus =
        currentBook.stockStatus === "IN_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK";

      // 2. Update UI instantly
      setBooks((prev) =>
        prev.map((b) =>
          b._id === id
            ? {
                ...b,
                stockStatus: newStatus,
                stockCount: newStatus === "IN_STOCK" ? 10 : 0,
              }
            : b
        )
      );

      // 3. Backend sync (fire & forget)
      axios
        .patch(
          `${backendUrl}api/seller/books/${id}/stock`,
          { status: newStatus }, // ← CORRECT newStatus
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        )
        .catch((err) => {
          console.error("Backend sync failed:", err);
          loadBooks(); // Revert on failure
          toast.error("UI updated, backend failed");
        });

      toast.success("✅ Stock updated!");
    } catch (err) {
      loadBooks();
      toast.error("Failed to update stock");
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book permanently?")) return;

    try {
      await axios.delete(`${backendUrl}api/seller/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks((prev) => prev.filter((b) => b._id !== id));
      toast.success("Book deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleEdit = (id) => {
    navigate(`/seller/edit-book/${id}`);
  };

  const handleAddBook = () => {
    navigate("/seller/add-book");
  };

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <section className="min-h-screen bg-green-100">
      <SNavBar />

      <div className="pt-16! flex justify-center">
        <div className="w-[95%] max-w-full bg-white rounded-2xl shadow-md border border-teal-100 px-6! md:px-10! py-8!">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6! mb-8!">
            <div>
              <h1 className="text-3xl font-bold text-teal-700 mb-2!">
                My Books
              </h1>
              <p className="text-gray-600">
                Manage your bookstore inventory ({books.length} books)
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search by title, genre, or author"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 md:w-72 rounded-full border border-teal-500 bg-white px-4! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleAddBook}
                className="hidden md:inline-flex items-center px-4! py-2! rounded-full bg-teal-500 text-white text-sm font-medium hover:text-black cursor-pointer"
              >
                + Add Book
              </button>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-teal-50 rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12! text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4!"></div>
                  <p className="text-gray-500">Loading your books...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-16! text-center">
                  <img
                    src={getBookImage(null)}
                    alt="No books"
                    className="mx-auto w-32! h-32! opacity-20 mb-4!"
                  />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2!">
                    No books yet
                  </h3>
                  <p className="text-gray-400 mb-6!">
                    Your bookstore is empty. Add your book to get started!
                  </p>
                  <button
                    onClick={handleAddBook}
                    className="px-8! py-3! bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 hover:text-black shadow-lg cursor-pointer"
                  >
                    Add Book
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-teal-100">
                  <thead className="bg-teal-50">
                    <tr>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Genres
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-8! py-4! text-right text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-100 bg-white">
                    {filtered.map((book) => (
                      <tr
                        key={book._id}
                        className="hover:bg-teal-50/50 transition-colors"
                      >
                        {/* Image */}
                        <td className="px-6! py-4! whitespace-nowrap">
                          <img
                            src={getBookImage(book.itemImage)}
                            alt={book.title}
                            className="w-16! h-24! object-cover rounded shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                            loading="lazy"
                          />
                        </td>

                        {/* Title */}
                        <td className="px-6! py-4!">
                          <div className="font-semibold text-gray-900 truncate max-w-xs">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1!">
                            {book.description?.substring(0, 50)}...
                          </div>
                        </td>

                        {/* Author */}
                        <td className="px-6! py-4!">
                          <div className="font-medium text-gray-900 text-sm">
                            {book.author}
                          </div>
                        </td>

                        {/* Genres */}
                        <td className="px-6! py-4!">
                          <div className="flex flex-wrap gap-1! mt-2!">
                            {book.genres?.slice(0, 3).map((genre) => (
                              <span
                                key={genre}
                                className="px-2! py-1! bg-teal-100 text-teal-800 text-xs rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                            {book.genres?.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{book.genres.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6! py-4! whitespace-nowrap">
                          <div className="text-md font-semibold text-black">
                            ₹{Number(book.price).toLocaleString()}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-6! py-4! whitespace-nowrap">
                          <button
                            onClick={() => toggleStock(book._id)}
                            className={`inline-flex items-center px-4! py-2! rounded-full text-sm cursor-pointer  transition-all ${
                              book.stockStatus === "IN_STOCK"
                                ? "bg-emerald-100 text-teal-800 hover:bg-emerald-200 "
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200 "
                            }`}
                          >
                            {book.stockStatus === "IN_STOCK" ? (
                              <>
                                ✅ In Stock
                                <span className="ml-2! text-xs bg-emerald-200 px-2! py-0.5! rounded-full">
                                  {book.stockCount || "∞"}
                                </span>
                              </>
                            ) : (
                              "❌ Out of Stock"
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6! py-3! text-right space-x-2!">
                          <button
                            onClick={() => handleEdit(book._id)}
                            className="text-xs text-teal-800 font-semibold hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(book._id)}
                            className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {!loading && (
              <div className="px-6! py-4! bg-teal-50 border-t border-teal-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4! text-sm text-teal-700">
                  <span>
                    Showing <strong>{filtered.length}</strong> of{" "}
                    <strong>{books.length}</strong> books
                  </span>
                  <div className="flex gap-2!">
                    <button className="px-4! py-1.5! bg-white border border-teal-300 text-teal-700 rounded-full hover:bg-teal-50 transition-all">
                      Previous
                    </button>
                    <button className="px-4! py-1.5! bg-teal-500 text-white rounded-full hover:bg-teal-600 shadow-sm transition-all">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SProduct;
