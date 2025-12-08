// pages/Seller/SEditBook.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SNavBar from "../../components/SellerComponents/SNavBar.jsx";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const SEditBook = () => {
  const { backendUrl, token } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentImage, setCurrentImage] = useState(null); // Preview current image

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    genres: "",
    description: "",
    pages: "",
    itemImage: null, // Will be File | null
  });

  const loadBook = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}api/seller/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const b = data.book;

      setForm({
        title: b.title || "",
        author: b.author || "",
        price: b.price ?? "",
        genres: b.genres?.join(", ") || "",
        description: b.description || "",
        pages: b.pages ?? "",
        itemImage: null,
      });
      console.log(`${b.itemImage}`);

      // ✅ FIX: Correct image URL format
      if (b.itemImage) {
        // Option 1: If images served from /images/books/
        setCurrentImage(`${b.itemImage}`);

        // Option 2: If images stored as full paths in DB
        // setCurrentImage(b.itemImage);

        // Option 3: If using getBookImage helper
        // setCurrentImage(getBookImage(b.itemImage));
      } else {
        setCurrentImage(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load book");
      navigate("/seller/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [id, backendUrl, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm((f) => ({ ...f, itemImage: file }));

      // Preview new image
      const reader = new FileReader();
      reader.onload = (e) => setCurrentImage(e.target.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image file");
      e.target.value = ""; // Clear invalid file
    }
  };

  // In handleSubmit - REPLACE the image upload section:
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const submitData = {
        title: form.title,
        author: form.author,
        price: Number(form.price),
        genres: form.genres,
        description: form.description,
        pages: form.pages ? Number(form.pages) : undefined,
      };

      // Handle image upload ONLY if new file selected
      if (form.itemImage instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append("file", form.itemImage);
        imageFormData.append("upload_preset", "bookstore_upload"); // Cloudinary preset
        imageFormData.append("folder", "bookstore/sellers"); // Your folder structure

        // Upload to Cloudinary
        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dusl2uowv/image/upload", // Your cloud name
          imageFormData
        );

        submitData.itemImage = cloudinaryRes.data.secure_url;
        setCurrentImage(cloudinaryRes.data.secure_url); // Update preview
      }

      // Update book (itemImage is now Cloudinary URL or unchanged)
      await axios.patch(`${backendUrl}api/seller/books/${id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Book updated successfully!");
      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-green-100">
      <SNavBar />
      <div className="pt-16! flex justify-center">
        <div className="w-[95%] max-w-2xl bg-white rounded-2xl shadow-md border border-teal-100 px-6! md:px-10! py-8!">
          <h1 className="text-2xl font-bold text-teal-700 mb-2!">Edit Book</h1>
          <p className="text-sm text-gray-500 mb-6!">
            Update details for this book. Changes will be visible to buyers.
          </p>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
              Loading book...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4!">
              {/* Image Section */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2!">
                  Book Image
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {/* Image Preview */}
                  <div className="shrink-0">
                    <div className="w-24 h-36 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {currentImage ? (
                        <img
                          src={currentImage}
                          alt="Current book"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 text-center px-2">
                          No image
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File Input */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border border-teal-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB. Leave empty to keep current
                      image.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rest of your form fields (unchanged) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1!">
                  Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-teal-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1!">
                  Author
                </label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className="w-full border border-teal-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3!">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1!">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full border border-teal-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1!">
                    Pages
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="pages"
                    value={form.pages}
                    onChange={handleChange}
                    className="w-full border border-teal-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1!">
                  Genres (comma separated)
                </label>
                <input
                  name="genres"
                  value={form.genres}
                  onChange={handleChange}
                  placeholder="Fantasy, Sci-Fi, Thriller"
                  className="w-full border border-teal-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1!">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-teal-300 rounded-lg px-3! py-2! text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3! pt-2!">
                <button
                  type="button"
                  onClick={() => navigate("/seller/products")}
                  className="px-4! py-1.5! rounded-full border border-gray-400 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4! py-1.5! rounded-full bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default SEditBook;
