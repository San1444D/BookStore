import React, { useContext, useEffect, useState } from "react";
import SNavBar from "../../components/SellerComponents/SNavBar.jsx";
import { motion } from "motion/react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const SellerHome = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [stats, setStats] = useState({
    books: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);

      // ✅ NEW STATS ENDPOINT
      const { data } = await axios.get(`${backendUrl}api/seller/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats({
        books: data.books || 0,
        orders: data.orders || 0,
        revenue: data.revenue || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load stats");
      setStats({ books: 0, orders: 0, revenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [backendUrl, token]);

  const statsCards = [
    {
      label: "Books Listed",
      value: stats.books,
      color: "bg-linear-to-r from-teal-400 to-teal-500",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      color: "bg-linear-to-r from-emerald-400 to-emerald-500",
    },
  ];

  return (
    <section className="min-h-screen bg-linear-to-br from-green-50 to-teal-50">
      <SNavBar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-[92%] mx-auto! my-8! bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/50 px-8! py-12!"
      >
        {/* Title */}
        <div className="text-center mb-12!">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Seller Dashboard
          </h1>
          <p className="text-sm text-gray-600">Overall stats</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16!">
          {statsCards.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`${s.color} text-white rounded-2xl shadow-xl  p-8! flex flex-col items-center justify-center`}
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <p className="text-sm font-medium opacity-90 uppercase tracking-wide mb-2!">
                {s.label}
              </p>
              <p className="text-3xl lg:text-4xl font-black mb-1!">
                {loading ? <span className="animate-pulse">...</span> : s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-16! pt-12! border-t-2 border-teal-100">
          <h3 className="text-2xl font-semibold text-teal-700 mb-8! text-center">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/seller/products" className="group">
              <div className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl p-8! text-center shadow-xl hover:shadow-2xl">
                <div className="font-bold text-xl mb-2!">Manage Books</div>
                <div className="text-blue-100">View, edit, add books</div>
              </div>
            </a>
            <a href="/seller/orders" className="group">
              <div className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl p-8! text-center shadow-xl hover:shadow-2xl">
                <div className="font-bold text-xl mb-2!">View Orders</div>
                <div className="text-emerald-100">Update order status</div>
              </div>
            </a>
            <a href="/seller/add-book" className="group">
              <div className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl p-8! text-center shadow-xl hover:shadow-2xl">
                <div className="font-bold text-xl mb-2!">Add New Book</div>
                <div className="text-purple-100">List your next bestseller</div>
              </div>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SellerHome;
