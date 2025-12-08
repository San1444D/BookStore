import React from "react";
import { useState } from "react";
import { NavLink,useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";


const SNavBar = () => {
  const [open, setOpen] = useState(false);

    const { user,logout } = useContext(AppContext);
  

  const items = [
    { name: "Home", Link: "/seller" },
    { name: "My Products", Link: "/seller/products" },
    { name: "Add Book", Link: "/seller/add-book" },
    { name: "Orders", Link: "/seller/orders" },
  ];

  const navigate = useNavigate();

  return (
    <>
      {/* NAVBAR */}
      <nav className="h-20 bg-transparent flex justify-between items-center px-6! md:px-12! relative">
        {/* Logo */}
        <h1 className="text-3xl text-teal-500 font-bold">
          Book <span className="text-sm font-light">(Seller Panel)</span>
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="text-lg hover:text-teal-500 tansition cursor-pointer"
            >
              <NavLink to={item.Link} onClick={() => setOpen(false)}>
                {item.name}
              </NavLink>
            </li>
          ))}
          <li>{user ? user.name : "Name"}</li>
          <li>
            <button
              onClick={logout}
              className="bg-zinc-900 px-5! py-1.5! rounded-full text-white  text-sm hover:text-black hover:bg-teal-500 cursor-pointer"
            >
              Logout
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <img
          src={assets.menu_icon}
          alt="menu"
          className="w-7 md:hidden cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      </nav>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden bg-white/90  shadow-md rounded-xl px-6! py-4! absolute w-[90%] left-1/2 transform -translate-x-1/2 transition-all duration-300 z-50 ${
          open ? "top-20 opacity-100" : "top-10 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-4 text-center">
          <li>{user ? user.name : "Name"}</li>
          {items.map((item, idx) => (
            <li
              key={idx}
              className="py-2! text-lg hover:text-admin-btn cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <NavLink to={item.Link} onClick={() => setOpen(false)}>
                {item.name}
              </NavLink>
            </li>
          ))}

          <li>
            <button
              onClick={logout}
              className=" text-red-500 text-lg hover:text-red-600 cursor-pointer"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SNavBar;
