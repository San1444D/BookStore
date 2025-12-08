// pages/User/UCart.jsx
import React, { useEffect, useState, useContext } from "react";
import NavBar from "../../components/NavBar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { getBookImage } from "../../utils/imageHelper";
import { assets } from "../../assets/assets.js";
import { useNavigate } from "react-router-dom";

const UCart = () => {
  const { backendUrl, token, fetchCartCount } = useContext(AppContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}api/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const changeQty = async (bookId, newQty) => {
    if (newQty < 1) return;
    try {
      setItems((prev) =>
        prev.map((it) =>
          it.bookId === bookId ? { ...it, quantity: newQty } : it
        )
      );
      await axios.patch(
        `${backendUrl}api/user/cart/${bookId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCartCount();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity");
      loadCart();
    }
  };

  const removeItem = async (bookId) => {
    try {
      setItems((prev) => prev.filter((it) => it.bookId !== bookId));
      await axios.delete(`${backendUrl}api/user/cart/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCartCount();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
      loadCart();
    }
  };

  const clearCart = async () => {
    try {
      setItems([]);
      await axios.delete(`${backendUrl}api/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCartCount();
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear cart");
      loadCart();
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const subTotal = items.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
    0
  );

  const placeOrderFromCart = async () => {
    if (!items.length) return;

    const ok = window.confirm(
      `Place order for ${items.length} item${items.length > 1 ? "s" : ""}?`
    );
    if (!ok) return;

    try {
      setPlacing(true);

      // body can be empty now if backend uses profile address
      await axios.post(
        `${backendUrl}api/user/orders/from-cart`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order placed successfully");
      setItems([]);
      fetchCartCount();
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };


  return (
    <section className="min-h-screen bg-primary-home">
      <NavBar />

      <div className="w-full max-w-6xl mx-auto px-4! md:px-8! pt-8! pb-16!">
        <div className="flex items-baseline justify-between mb-4!">
          <h1 className="text-2xl md:text-3xl font-semibold">Your Cart</h1>
          <p className="text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading cart...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">Your cart is empty.</div>
        ) : (
          <div className="flex flex-col md:flex-row w-full gap-6!">
            {/* Left: cart items */}
            <div className="flex-1 md:mr-4! space-y-4!">
              {items.map((it) => {
                const total = Number(it.price || 0) * Number(it.quantity || 1);
                return (
                  <div
                    key={it.bookId}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4! md:px-6! py-4! flex gap-4! md:gap-6! items-center"
                  >
                    {/* image */}
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                      <img
                        src={getBookImage(it.itemImage)}
                        alt={it.title}
                        className="max-h-full object-contain"
                      />
                    </div>

                    {/* middle: title + meta */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm md:text-base font-semibold truncate">
                        {it.title}
                      </h2>
                      {it.author && (
                        <p className="text-xs text-gray-500 mt-0.5!">
                          {it.author}
                        </p>
                      )}
                      <span className="inline-block mt-2! px-2.5! py-0.5! rounded-full bg-blue-50 text-[10px] text-blue-700 font-medium">
                        Paperback
                      </span>
                    </div>

                    {/* right: price / qty / actions */}
                    <div className="flex flex-col items-end gap-3!">
                      <div className="text-sm font-semibold">
                        ₹{total.toLocaleString()}
                      </div>

                      {/* qty stepper */}
                      <div className="flex items-center border border-gray-300 rounded-full text-xs overflow-hidden">
                        <button
                          onClick={() =>
                            changeQty(it.bookId, Number(it.quantity) - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-primary-btn hover:text-white"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() =>
                            changeQty(it.bookId, Number(it.quantity) + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-primary-btn hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* remove */}
                      <div className="flex items-center gap-3! text-gray-400 text-lg">
                        <button
                          onClick={() => removeItem(it.bookId)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <img src={assets.delete_icon} alt="Delete" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: summary */}
            <aside className="w-full md:w-80 lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 px-5! py-5! h-fit self-start">
              <h2 className="text-sm font-semibold mb-3!">Order summary</h2>

              <div className="space-y-1.5! text-xs text-gray-600 mb-4!">
                {items.map((it) => (
                  <div key={it.bookId} className="flex justify-between gap-4!">
                    <span className="truncate">
                      x{it.quantity} {it.title}
                    </span>
                    <span>
                      ₹
                      {(
                        Number(it.price || 0) * Number(it.quantity || 1)
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4!">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-semibold">
                  ₹{subTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={placeOrderFromCart}
                disabled={placing}
                className="w-full py-2.5! rounded-full bg-primary-btn cursor-pointer hover:shadow-2xl hover:scale-101 transition-all duration-75  text-white text-sm font-semibold hover:bg-primary-btn-hover disabled:opacity-60"
              >
                {placing ? "Placing order..." : "Checkout"}
              </button>

              <div className="flex justify-end text-sm text-red-500 mt-4!">
                <button
                  onClick={clearCart}
                  className="hover:underline cursor-pointer"
                >
                  Empty cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default UCart;
