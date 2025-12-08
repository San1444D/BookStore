// App.jsx
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AppContext } from "./context/AppContext";

import AHome from "./pages/Admin/AHome.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import UHome from "./pages/User/UHome.jsx";
import UProfile from "./pages/User/UProfile.jsx";
import UBookList from "./pages/User/UBookList.jsx";
import UViewBook from "./pages/User/UViewBook.jsx";
import UCart from "./pages/User/UCart.jsx";
import UWishlist from "./pages/User/UWishlist.jsx";
import UOrders from "./pages/User/UOrders.jsx";
import UOrderDetails from "./pages/User/UOrderDetails.jsx";

import AUsersList from "./pages/Admin/AUsersList.jsx";
import ABooks from "./pages/Admin/Abooks.jsx";
import ASellersList from "./pages/Admin/ASellersList.jsx";

import SHome from "./pages/Seller/SHome.jsx";
import AddBook from "./pages/Seller/AddBook.jsx";
import SProduct from "./pages/Seller/SProduct.jsx";
import SOrders from "./pages/Seller/SOrders.jsx";
import SEditBook from "./pages/Seller/SEditBook.jsx";

import { ToastContainer } from "react-toastify";

const App = () => {
  const { showLogin } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-[#feebe7]">
      {showLogin && <Login />}
      <ToastContainer position="bottom-right" />

      <Routes>
        {/* user side */}
        <Route path="/" element={<UHome />} />
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/profile" element={<UProfile />} />
          <Route path="/books" element={<UBookList />} />
          <Route path="/books/:bookId" element={<UViewBook />} />
          <Route path="/cart" element={<UCart />}></Route>
          <Route path="/wishlist" element={<UWishlist />}></Route>
          <Route path="/orders" element={<UOrders />} />
          <Route path="/orders/:orderId" element={<UOrderDetails />} />
        </Route>

        {/* ADMIN-ONLY routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AHome />} />
          <Route path="/admin/users" element={<AUsersList />} />
          <Route path="/admin/sellers" element={<ASellersList />} />
          <Route path="/admin/books" element={<ABooks />} />
        </Route>
        {/* SELLER-ONLY routes */}
        <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
          <Route path="/seller" element={<SHome />} />
          <Route path="/seller/add-book" element={<AddBook />} />
          <Route path="/seller/products" element={<SProduct />} />
          <Route path="/seller/orders" element={<SOrders />} />
          <Route path="/seller/edit-book/:id" element={<SEditBook />} />
          <Route path="/seller/stats" element={<SHome />} />
        </Route>
        {/* add more later: /admin/sellers, /admin/books, etc. */}
      </Routes>
    </div>
  );
};

export default App;
