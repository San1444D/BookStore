// pages/Admin/ASellersList.jsx
import React, { useContext, useEffect, useState } from "react";
import ANavBar from "../../components/AdminComponents/ANavBar";
import { motion } from "motion/react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ASellersList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [sellers, setSellers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { backendUrl, token } = useContext(AppContext);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingSeller, setEditingSeller] = useState(null);

  const filtered = sellers.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const loadSellers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}api/admin/sellers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellers(data.sellers || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load sellers");
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleSaveSeller = async (e) => {
    e.preventDefault();
    try {
      if (editingSeller) {
        const { data } = await axios.patch(
          `${backendUrl}api/admin/sellers/${editingSeller._id}`,
          { name: form.name, email: form.email },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSellers((prev) =>
          prev.map((s) => (s._id === editingSeller._id ? data.seller : s))
        );
        toast.success("Seller updated");
      } else {
        const { data } = await axios.post(
          `${backendUrl}api/admin/sellers`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSellers((prev) => [data.seller, ...prev]);
        toast.success("Seller created");
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const handleEdit = (id) => {
    const s = sellers.find((x) => x._id === id);
    if (!s) return;
    setEditingSeller(s);
    setForm({ name: s.name, email: s.email, password: "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;
    try {
      await axios.delete(`${backendUrl}api/admin/sellers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // ASellersList.jsx - Update handleViewBooks:
  const handleViewBooks = (sellerId, sellerName) => {
    navigate(
      `/admin/books?sellerId=${sellerId}&sellerName=${encodeURIComponent(
        sellerName
      )}`
    );
  };

  return (
    <div className="bg-admin-home min-h-screen">
      <ANavBar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-6! px-8!"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Sellers</h2>
            <p className="text-sm text-gray-500">
              Manage all seller accounts and their bookstores.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by seller or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-64 rounded-full border border-gray-400 bg-white px-4! py-2! text-sm focus:outline-none focus:ring-1 focus:ring-admin-btn/70"
            />
            <button
              onClick={() => {
                setEditingSeller(null);
                setForm({ name: "", email: "", password: "" });
                setShowForm(true);
              }}
              className=" sm:inline-flex items-center px-4! py-2! rounded-full bg-admin-btn text-white text-sm font-medium cursor-pointer hover:text-black"
            >
              + Add Seller
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6! py-3! text-left">SNo</th>
                  <th className="px-6! py-3! text-left">Seller</th>
                  <th className="px-6! py-3! text-left">Email</th>
                  <th className="px-6! py-3! text-left">Books Listed</th>
                  <th className="px-6! py-3! text-left">View Books </th>
                  <th className="px-6! py-3! text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-gray-50/60">
                    <td className="px-6! py-3! font-medium text-gray-800">
                      {idx + 1}
                    </td>
                    <td className="px-6! py-3! font-medium text-gray-800">
                      {s.name}
                    </td>
                    <td className="px-6! py-3! text-gray-600">{s.email}</td>
                    <td className="px-6! py-3! text-gray-700">
                      {s.totalBooks ?? 0}
                    </td>
                    <td className="px-6! py-3!">
                      <button
                        onClick={() => handleViewBooks(s._id, s.name)}
                        className="inline-flex text-xs bg-admin-home px-3! py-1! rounded-full cursor-pointer hover:bg-admin-btn hover:text-white"
                      >
                        View Books ({s.totalBooks || 0})
                      </button>
                    </td>
                    <td className="px-6! py-3! text-right space-x-2!">
                      <button
                        onClick={() => handleEdit(s._id)}
                        className="text-xs text-admin-btn font-semibold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6! py-6! text-center text-sm text-gray-500"
                    >
                      No sellers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* footer */}
          <div className="flex items-center justify-between px-6! py-3! text-xs text-gray-500 bg-gray-50">
            <span>Showing {filtered.length} sellers</span>
            <button className="text-admin-btn hover:underline cursor-pointer">
              View all
            </button>
          </div>
        </div>
      </motion.div>

      {/* add/edit seller form  */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleSaveSeller}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm px-6! py-5! space-y-4!"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {editingSeller ? "Edit Seller" : "Add Seller"}
            </h3>

            <div className="space-y-3!">
              <input
                type="text"
                placeholder="Seller Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-admin-btn/70"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-admin-btn/70"
              />
              {!editingSeller && (
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-admin-btn/70"
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2!">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4! py-1.5! rounded-full border border-gray-400 text-xs text-gray-600 hover:border-black hover:text-white hover:bg-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4! py-1.5! rounded-full bg-admin-btn text-white text-xs font-semibold hover:bg-blue-800 cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ASellersList;
