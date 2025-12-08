import React from "react";
import { assets } from "../assets/assets";
import NavBar from "./NavBar";
import { delay, motion } from "motion/react";

const Home = () => {
  return (
    <section className="relative w-full min-h-screen bg-primary-home overflow-hidden">
      {/* ----------- NAVBAR ----------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [-10, 0] }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <NavBar />
      </motion.div>

      {/* =====================================================
            FLOATING DECORATIONS (HIDDEN ON MOBILE)
         ===================================================== */}
      <div className="hidden md:block">
        {/* LEFT — Top Books */}
        <div className="absolute top-32 left-24">
          <div className="relative">
            <motion.img
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: [-10, 0] }}
              transition={{ duration: 1, delay: 0.4 }}
              src={assets.top_book_2}
              className="h-[130px] absolute top-6 left-20 opacity-90"
            />
            <motion.img
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: [-10, 0] }}
              transition={{ duration: 1, delay: 0.6 }}
              src={assets.stranger_again}
              className="h-[180px] relative z-10 drop-shadow-lg"
            />
          </div>
        </div>

        {/* LEFT — Doodle face */}
        <motion.div
          initial={{ opacity: 0, y: -120 }}
          animate={{ opacity: 1, y: [-120, 0] }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-52 left-82"
        >
          <img src={assets.doodle_women} className="h-[180px]" />
        </motion.div>

        {/* LOWER LEFT — Devices */}
        <div className="bottom-0 left-10">
          {/* sprinkle */}
          <motion.img
            initial={{ opacity: 0, x: -60, y: -30 }}
            animate={{ opacity: 1, x: [-60, 0], y: [-30, 0] }}
            transition={{ duration: 1, delay: 0.8 }}
            src={assets.sprinkle}
            className="absolute bottom-0 left-30 h-[300px] rotate-[-20deg] z-10"
          />

          {/* blue circle */}
          <motion.img
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: [-120, 0] }}
            transition={{ duration: 1, delay: 0.6 }}
            src={assets.blue_circle}
            className="absolute bottom-20 -left-16 h-[200px] z-10"
          />

          {/* Kindle */}
          <motion.img
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: [-120, 0] }}
            transition={{ duration: 1, delay: 0.2 }}
            src={assets.kindle_img}
            className="absolute left-40 bottom-24 h-[260px] drop-shadow-2xl z-20"
          />

          {/* Mobile */}
          <motion.img
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: [-120, 0] }}
            transition={{ duration: 1, delay: 0.4 }}
            src={assets.mobile_img}
            className="absolute left-30 bottom-12 h-[200px] drop-shadow-2xl z-30"
          />
        </div>

        {/* LEFT — Earbuds */}
        <motion.img
          // bounce
          initial={{ opacity: 0, y: -120 }}
          animate={{ opacity: 1, y: [-120, 0, -30, 0, -10, 0] }}
          transition={{ duration: 0.8, delay: 1 }}
          src={assets.earbuds_left}
          className="absolute top-40 right-[550px] h-25"
        />

        {/* RIGHT — Earbuds */}
        <motion.img
          // bounce
          initial={{ opacity: 0, y: -120 }}
          animate={{ opacity: 1, y: [-120, 0, -30, 0, -10, 0] }}
          transition={{ duration: 1, delay: 1.4 }}
          src={assets.earbuds_right}
          className="absolute top-32 right-[500px] h-25"
        />

        {/* RIGHT — Pen sketch */}
        <motion.img
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: [30, 0] }}
          transition={{ duration: 0.8, delay: 0.8 }}
          src={assets.pen_sketch}
          className="absolute top-44 right-0 h-[260px] opacity-90"
        />

        {/* RIGHT — Red Circle */}
        <motion.img
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: [-30, 0] }}
          transition={{ duration: 1, delay: 0.6 }}
          src={assets.red_circle}
          className="absolute top-20 right-18 h-[230px] rotate-[-10deg]"
        />

        {/* RIGHT — Tablet */}
        <motion.img
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: [80, 0] }}
          transition={{ duration: 0.8, delay: 0.2 }}
          src={assets.tab_img}
          className="absolute top-32 right-18 h-[280px] drop-shadow-xl"
        />

        {/* RIGHT — Pen */}
        <motion.img
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: [30, 0] }}
          transition={{ duration: 0.8, delay: 0.8 }}
          src={assets.pen}
          className="absolute top-48 right-15 h-[150px]"
        />

        {/* RIGHT BOTTOM — Books */}
        <motion.img
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [30, 0] }}
          transition={{ duration: 0.8, delay: 0.2 }}
          src={assets.bottom_book_2}
          className="absolute bottom-24 right-24 h-[220px]"
        />

        <motion.img
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [30, 0] }}
          transition={{ duration: 1, delay: 0.4 }}
          src={assets.books.ratan_tata}
          className="absolute bottom-24 right-48 h-[180px]"
        />

        <motion.img
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [30, 0] }}
          transition={{ duration: 1, delay: 0.6 }}
          src={assets.doodle_plane}
          className="absolute bottom-10 right-[550px] h-[90px]"
        />
      </div>

      {/* =====================================================
            CENTER CONTENT (ALWAYS VISIBLE)
         ===================================================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-[90vh] flex flex-col justify-center items-center text-center px-4"
      >
        {/* Center icon */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [0.8, 1] }}
          transition={{ duration: 1, delay: 0.2 }}
          src={assets.book_img}
          className="h-20 mb-6!"
        />

        {/* badge */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-[14px] text-text-primary-light tracking-[0.2em] uppercase mb-6!"
        >
          THIS IS YOUR WORLD
        </motion.p>

        {/* heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-[520px] text-[42px] md:text-[50px] font-light font-heading! leading-10 mb-6!"
        >
          Discover a story that might change your day
        </motion.h1>

        {/* sub text */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="max-w-[520px] text-[16px]! md:text-[18px] text-text-primary-gray leading-[1.7] mb-8!"
        >
          Explore thousands of books across genres for every age and curiosity,
          trusted by over 200,000 readers who keep coming back.
        </motion.p>

        {/* CTA button (same colour as screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="text-text-primary-gray inline-flex text-center gap-2 bg-white/60 px-6! py-1! rounded-full border border-neutral-300"
        >
          <p >📖 Discover your best books here.</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Home;
