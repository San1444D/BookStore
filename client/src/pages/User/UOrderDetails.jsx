// pages/User/UOrderDetails.jsx
import React, { useContext, useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { getBookImage } from "../../utils/imageHelper";

const UOrderDetails = () => {
  const { backendUrl, token } = useContext(AppContext);
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // bookId -> book (to get itemImage, title if needed)
  const [booksMap, setBooksMap] = useState({});
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!order) return;
    const ok = window.confirm("Are you sure you want to cancel this order?");
    if (!ok) return;

    try {
      setCancelling(true);
      const { data } = await axios.patch(
        `${backendUrl}api/user/orders/${order._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order cancelled");
      setOrder(data.order); // update status locally
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };


  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const loadOrder = async () => {
    if (!token) return;
    try {
      setLoadingOrder(true);
      const { data } = await axios.get(
        `${backendUrl}api/user/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoadingOrder(false);
    }
  };

  const loadBooksForOrder = async (orderData) => {
    try {
      setLoadingBooks(true);
      const uniqueIds = [
        ...new Set(orderData.items.map((it) => it.bookId?.toString())),
      ].filter(Boolean);

      // fetch each book once
      const promises = uniqueIds.map((id) =>
        axios
          .get(`${backendUrl}api/user/books/${id}`)
          .then((res) => ({ id, book: res.data.book }))
          .catch((err) => {
            console.error("load book for order error:", err);
            return null;
          })
      );

      const results = await Promise.all(promises);
      const map = {};
      results.forEach((r) => {
        if (r && r.book) map[r.id] = r.book;
      });
      setBooksMap(map);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await loadOrder();
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  // once order is loaded, fetch books for images
  useEffect(() => {
    if (order && order.items?.length) {
      loadBooksForOrder(order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (loadingOrder || !order) {
    return (
      <section className="min-h-screen bg-primary-home">
        <NavBar />
        <div className="max-w-5xl mx-auto px-4! md:px-8! pt-10!">
          <div className="text-gray-500">Loading order details...</div>
        </div>
      </section>
    );
  }

  const firstItem = order.items[0];
  const firstBook = booksMap[firstItem.bookId] || {};
  const coverSrc = firstBook.itemImage
    ? getBookImage(firstBook.itemImage)
    : null;

  return (
    <section className="min-h-screen bg-primary-home">
      <NavBar />

      <div className="max-w-5xl mx-auto! px-4! md:px-8! pt-6! pb-16!">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="text-sm font-semibold cursor-pointer text-primary-btn mb-3! hover:underline"
        >
          ← Back to My Orders
        </button>

        <div className="flex flex-col lg:flex-row gap-6!">
          {/* LEFT: main order info */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5!">
            <div className="flex gap-4!">
              <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={firstItem.title}
                    className="max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-lg font-semibold truncate">
                  {firstItem.title}
                </h1>
                {order.items.length > 1 && (
                  <p className="text-xs text-gray-500 mt-0.5!">
                    + {order.items.length - 1} more item
                    {order.items.length > 2 ? "s" : ""}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1!">
                  Order ID: {order._id}
                </p>
                <p className="text-xs text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
                <p className="text-base font-semibold mt-2!">
                  ₹{Number(order.totalAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* simple status info */}
            <div className="mt-6! border-t border-gray-100 pt-4!">
              <h2 className="text-sm font-semibold mb-3!">Status</h2>
              <ul className="text-xs text-gray-700 space-y-2!">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>
                    Order {order.status.toLowerCase()} on{" "}
                    {formatDate(order.BookingDate || order.createdAt)}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>
                    Estimated delivery by{" "}
                    {formatDate(order.Delivery || order.createdAt)}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT: delivery + price */}
          <div className="w-full lg:w-80 flex flex-col gap-4!">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5!">
              <h2 className="text-sm font-semibold mb-3!">Delivery details</h2>
              <p className="text-xs text-gray-700 mb-1!">{order.flatno}</p>
              <p className="text-xs text-gray-700">
                {order.city}, {order.state} - {order.pincode}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5!">
              <h2 className="text-sm font-semibold mb-3!">Price details</h2>
              <div className="space-y-1.5! text-xs text-gray-700 mb-3!">
                <div className="flex justify-between">
                  <span>Items ({order.items.length})</span>
                  <span>
                    ₹{Number(order.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2.5! flex justify-between text-sm font-semibold">
                <span>Total amount</span>
                <span>₹{Number(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {!["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status) && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="mt-3! w-full py-2! rounded-full border cursor-pointer border-red-500 text-red-500 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>

        {/* Items list with per-item images */}
        <div className="mt-6! bg-white rounded-2xl shadow-sm border border-gray-100 p-5!">
          <h2 className="text-sm font-semibold mb-3!">Items in this order</h2>
          <div className="space-y-3!">
            {order.items.map((it) => {
              const book = booksMap[it.bookId] || {};
              const imgSrc = book.itemImage
                ? getBookImage(book.itemImage)
                : null;
              return (
                <div
                  key={it.bookId}
                  className="flex gap-4! items-center border-b border-gray-100 last:border-b-0 pb-3!"
                >
                  <div className="w-14 h-18 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={it.title}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{it.title}</p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {it.quantity}
                    </p>
                  </div>
                  <div className="text-xs font-semibold">
                    ₹{Number(it.subtotal || it.price || 0).toLocaleString()}
                  </div>
                </div>
              );
            })}
            {loadingBooks && (
              <p className="text-[11px] text-gray-400">
                Loading book images...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UOrderDetails;
