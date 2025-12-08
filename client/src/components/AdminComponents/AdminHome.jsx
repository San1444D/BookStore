import React, { useContext, useEffect, useState } from "react";
import ANavBar from "./ANavBar.jsx";
import { motion } from "motion/react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets.js";

const AdminHome = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [stats, setStats] = useState({
    users: 0,
    sellers: 0,
    books: 0,
    orders: 0,
  });

  const loadStats = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to load dashboard stats"
      );
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const items = [
    { name: "Users", value: stats.users, color: "bg-[#c5d7ff]" },
    { name: "Vendors", value: stats.sellers, color: "bg-[#8af9d9]" },
    { name: "Books", value: stats.books, color: "bg-[#d8c0b4]" },
    { name: "Total Orders", value: stats.orders, color: "bg-[#e7f9ed]" },
  ];

  return (
    <section className="relative min-h-screen bg-admin-home">
      <ANavBar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-[92%] mx-auto! mt-10! bg-white/80 p-8! rounded-xl shadow-md"
      >
        <h1 className="text-center text-2xl md:text-3xl text-admin-btn font-semibold mb-8!">
          Admin Dashboard
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12!">
          {items.map((item) => (
            <div
              key={item.name}
              className={`${item.color} rounded-xl shadow-md text-black px-6! py-5! flex flex-col justify-center items-center`}
            >
              <p className="text-lg md:text-xl font-semibold tracking-wider">
                {item.name}
              </p>
              <p className="text-3xl md:text-4xl font-bold mt-2!">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Graph placeholder – later connect to real chart.js data */}
        <div className="bg-gray-200 h-[250px] md:h-[300px] lg:h-[350px] rounded-xl flex flex-wrap justify-center items-center shadow-inner">
          <img
            src={assets.admin_dashboard}
            alt="image"
            className="h-[80%] w-full object-contain"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default AdminHome;
