// pages/Admin/ABooks.jsx
import React, { useEffect, useState, useContext } from "react";
import ANavBar from "../../components/AdminComponents/ANavBar.jsx";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { getBookImage } from "../../utils/imageHelper.js";

const ABooks = () => {
  const { backendUrl, token } = useContext(AppContext);

  const [books, setBooks] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSellers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}api/admin/sellers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllSellers(data.sellers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      let url = `${backendUrl}api/admin/books`;

      if (selectedSellers.length > 0) {
        url += `?sellerIds=${selectedSellers.join(",")}`;
        console.log("🔍 Filtering by sellers:", selectedSellers);
      }

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(data.books || []);
    } catch (err) {
      toast.error("Failed to load books");
      console.error("Load books error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeller = (sellerId) => {
    setSelectedSellers((prev) =>
      prev.includes(sellerId)
        ? prev.filter((id) => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const clearFilters = () => {
    setSelectedSellers([]);
    setSearch("");
  };

  // ✅  Auto-load books when sellers change OR on mount
  useEffect(() => {
    loadSellers();
  }, []);

  useEffect(() => {
    loadBooks(); // ✅ Always load when sellers change
  }, [selectedSellers]);

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author || ""} ${book.genres?.join(" ")} ${
      book.sellerName || book.sellerId?.name || ""
    }`
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book from the platform?")) return;

    try {
      await axios.delete(`${backendUrl}api/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks((prev) => prev.filter((b) => b._id !== id));
      toast.success("Book deleted");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  return (
    <section className="min-h-screen bg-admin-home">
      <ANavBar />

      <div className="pt-16! flex justify-center">
        <div className="w-[92%] max-w-6xl bg-white rounded-2xl shadow-md px-6! md:px-10! py-8!">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4! mb-8!">
            <div>
              <h1 className="text-3xl font-bold text-admin-btn mb-2!">
                All Books
              </h1>
              <p className="text-gray-600">
                Manage platform inventory ({filteredBooks.length} shown)
                {selectedSellers.length > 0 && (
                  <span className="ml-2! text-sm bg-blue-100 px-2! py-1! rounded-full">
                    {selectedSellers.length} seller(s) filtered
                  </span>
                )}
              </p>
            </div>

            {/* Search + Filter Buttons */}
            <div className="flex flex-wrap gap-3!">
              <input
                type="text"
                placeholder="🔍 Search books, author, genres, seller"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 max-w-lg px-5! py-3! border border-admin-btn/50 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-admin-btn shadow-sm"
              />

              <button
                onClick={() => setShowFilterModal(true)}
                className="px-6! py-3! bg-admin-btn text-white font-semibold rounded-full cursor-pointer hover:text-black hover:bg-opacity-90 shadow-lg whitespace-nowrap flex items-center gap-2!"
              >
                Filter Sellers
              </button>

              {(search || selectedSellers.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="px-6! py-3! bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl shadow-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-20! text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-admin-btn mx-auto mb-6!"></div>
                  <p className="text-xl text-gray-500">Loading books...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="p-20! text-center text-gray-500">
                  <div className="w-24! h-24! bg-gray-200 rounded-2xl mx-auto! mb-6! flex items-center justify-center">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4!">
                    No books match
                  </h3>
                  <p className="max-w-md mx-auto!">
                    Try different search terms or seller filters
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6! py-4! text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Genres
                      </th>
                      <th className="px-8! py-4! text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBooks.map((book) => (
                      <tr key={book._id} className="hover:bg-gray-50">
                        <td className="px-6! py-4!">
                          <div className="flex items-center gap-4!">
                            <img
                              src={getBookImage(book.itemImage)}
                              alt={book.title}
                              className="w-14! h-20! object-cover rounded shadow-sm shrink-0"
                              loading="lazy"
                            />
                            <div>
                              <div className="font-semibold text-gray-900 truncate max-w-sm">
                                {book.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {book.author || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6! py-4! font-medium text-gray-900">
                          {book.sellerName || book.sellerId?.name || "N/A"}
                        </td>
                        <td className="px-6! py-4! whitespace-nowrap">
                          <div className="text-xl font-bold text-admin-btn">
                            ₹{Number(book.price).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6! py-4!">
                          <div className="flex flex-wrap gap-1!">
                            {book.genres?.slice(0, 3).map((genre) => (
                              <span
                                key={genre}
                                className="px-2.5! py-1! bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6! py-4! text-right">
                          <button
                            onClick={() => handleDelete(book._id)}
                            className="px-4! py-2! bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium rounded-full text-sm shadow-sm transition-all cursor-pointer"
                          >
                            Remove
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
              <div className="px-6! py-4! bg-gray-50 border-t flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Showing <strong>{filteredBooks.length}</strong> of{" "}
                  <strong>{books.length}</strong> books
                </span>
                <button className="text-admin-btn hover:underline font-medium px-4! py-2! bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal - NO applyFilters needed */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4!">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="px-6! py-6! border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Filter Sellers
                </h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1!">
                Select sellers (auto-applies when you close)
              </p>
            </div>

            <div className="p-6! max-h-96 overflow-y-auto">
              <div className="space-y-2!">
                {allSellers.map((seller) => (
                  <label
                    key={seller._id}
                    className="flex items-center gap-3! p-3! rounded-xl hover:bg-gray-100 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSellers.includes(seller._id)}
                      onChange={() => toggleSeller(seller._id)}
                      className="w-5! h-5! rounded text-admin-btn focus:ring-admin-btn/50 shadow-sm"
                    />
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-admin-btn">
                        {seller.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {seller.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6! py-4! bg-gray-50 border-t flex gap-3! justify-end">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-6! py-2.5! border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ABooks;
