// AddBook.jsx
import React, { useState, useContext } from "react";
import SNavBar from "../../components/SellerComponents/SNavBar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { ALL_GENRES } from "../../assets/assets";



const allGenres = ALL_GENRES;

const AddBook = () => {
  const { backendUrl, token } = useContext(AppContext);

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    description: "",
  });
  const [genres, setGenres] = useState([]);
  const [itemImage, setItemImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setItemImage(e.target.files[0] || null);
  };

  const toggleGenre = (g, checked) => {
    setGenres((prev) =>
      checked ? [...prev, g] : prev.filter((item) => item !== g)
    );
  };

  const clearForm = () => {
    setForm({ title: "", author: "", price: "", description: "" });
    setGenres([]);
    setItemImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (genres.length === 0) {
      toast.error("Select at least one genre");
      return;
    }

    if (!form.title.trim() || !form.author.trim() || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }

    const ok = window.confirm("Are you sure you want to add this book?");
    if (!ok) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("author", form.author.trim());
    formData.append("genres", JSON.stringify(genres));
    formData.append("price", Number(form.price));
    formData.append("description", form.description.trim());
    if (itemImage) {
      formData.append("itemImage", itemImage);
    }

    try {
      await axios.post(`${backendUrl}api/seller/books`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Book added successfully!");
      clearForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const ok = window.confirm("Discard changes?");
    if (ok) {
      clearForm();
    }
  };

  return (
    <section className="min-h-screen bg-green-100">
      <SNavBar />
      <div className="flex items-start justify-center pt-16!">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-teal-50 px-8! py-10!">
          <h1 className="text-center text-2xl md:text-3xl font-semibold text-teal-500 mb-10!">
            Add Book
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5!">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2!">
                Title *
              </label>
              <input
                name="title"
                type="text"
                placeholder="Enter book title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border border-teal-200 bg-[#fffdf7] rounded-lg px-4! py-3! text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2!">
                Author *
              </label>
              <input
                name="author"
                type="text"
                placeholder="Enter author name"
                value={form.author}
                onChange={handleChange}
                required
                className="w-full border border-teal-200 bg-[#fffdf7] rounded-lg px-4! py-3! text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3!">
                Genres * (Select at least one)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-full overflow-y-auto p-2! border border-teal-200 bg-[#fffdf7] rounded-lg">
                {allGenres.map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 p-2! rounded cursor-pointer hover:bg-teal-50"
                  >
                    <input
                      type="checkbox"
                      value={g}
                      checked={genres.includes(g)}
                      onChange={(e) => toggleGenre(g, e.target.checked)}
                      className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
              <p
                className={`text-xs mt-1! ${
                  genres.length === 0 ? "text-red-500" : "text-teal-600"
                }`}
              >
                {genres.length} genres selected
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2!">
                Price (₹) *
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full border border-teal-200 bg-[#fffdf7] rounded-lg px-4! py-3! text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2!">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter book description (optional)"
                rows={4}
                value={form.description}
                onChange={handleChange}
                className="w-full border border-teal-200 bg-[#fffdf7] rounded-lg px-4! py-3! text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2!">
                Book Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-teal-200 bg-white rounded-lg px-4! py-3! text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-teal-600 cursor-pointer"
              />
              {itemImage && (
                <p className="text-xs text-teal-600 mt-1!">
                  {itemImage.name} selected
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4!">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 border border-teal-500 text-teal-700 py-3! rounded-lg text-sm font-semibold hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3! rounded-lg text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Adding Book..." : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddBook;
