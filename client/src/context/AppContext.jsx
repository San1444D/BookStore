// context/AppContext.jsx
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const role = (user?.role || localStorage.getItem("role") || "").toLowerCase();

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setShowLogin(false);
    setCartCount(0);
    setWishlistCount(0);
    setWishlistItems([]);
    navigate("/");
  };

  // cart
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await axios.get(`${backendUrl}api/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = data.items || [];
      const total = items.reduce(
        (sum, it) => sum + Number(it.quantity || 1),
        0
      );
      setCartCount(total);
    } catch (err) {
      console.error(err);
      setCartCount(0); // Reset on error
    }
  };

  // wishlist
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlistCount = async () => {
    if (!token) {
      setWishlistCount(0);
      setWishlistItems([]);
      return;
    }
    try {
      const { data } = await axios.get(`${backendUrl}api/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = data.items || data || [];
      setWishlistCount(items.length);
      setWishlistItems(items);
    } catch (err) {
      console.error(err);
      setWishlistCount(0);
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      setWishlistItems([]);
      return;
    }

    // Only fetch cart/wishlist for USER role
    if (role === "user") {
      fetchCartCount();
      fetchWishlistCount();
    } else {
      // Admin/Seller: no cart/wishlist
      setCartCount(0);
      setWishlistCount(0);
      setWishlistItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]); // Added role to deps

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    token,
    setToken,
    logout,
    role,
    cartCount,
    setCartCount,
    fetchCartCount,
    wishlistCount,
    setWishlistCount,
    wishlistItems,
    setWishlistItems,
    fetchWishlistCount,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
