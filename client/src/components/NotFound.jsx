// NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center px-4!">
      <div className="w-full max-w-2xl bg-white border border-[#d8e0ff] rounded-3xl shadow-sm py-16! px-6! md:px-12! text-center">
        <h1 className="text-[80px] md:text-[96px] font-bold text-[#ff4b4b] leading-none mb-4!">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3!">
          Oops! Page Not Found
        </h2>

        <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto! mb-8!">
          It seems like you&apos;ve wandered off the path. The page you&apos;re
          looking for doesn&apos;t exist or has been moved.
        </p>

        {/* <Link
          to="/"
          className="inline-flex items-center justify-center px-6! py-2.5! rounded-full bg-admin-btn text-white text-sm font-medium shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:bg-[#1d4fd8] transition-colors"
        >
          ← Back to Home
        </Link> */}
      </div>
    </div>
  );
};

export default NotFound;
