// pages/User/UOrders.jsx
import React, { useContext, useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const UOrders = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  

  // filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // LAST_30, THIS_YEAR, OLDER
  const navigate = useNavigate();

  const loadOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}api/user/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const matchStatus = (order) => {
    if (statusFilter === "ALL") return true;
    return order.status === statusFilter;
  };

  const matchDate = (order) => {
    if (dateFilter === "ALL") return true;
    const created = new Date(order.createdAt);
    const now = new Date();
    if (dateFilter === "LAST_30") {
      const diff = (now - created) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    }
    if (dateFilter === "THIS_YEAR") {
      return created.getFullYear() === now.getFullYear();
    }
    if (dateFilter === "OLDER") {
      return created.getFullYear() < now.getFullYear();
    }
    return true;
  };

  const matchSearch = (order) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    // check each item title
    return order.items.some((it) => (it.title || "").toLowerCase().includes(q));
  };

  const filteredOrders = orders.filter(
    (o) => matchStatus(o) && matchDate(o) && matchSearch(o)
  );

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const statusBadgeClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "CONFIRMED":
        return "bg-amber-100 text-amber-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  return (
    <section className="min-h-screen bg-primary-home">
      <NavBar />

      <div className="max-w-6xl mx-auto! px-4! md:px-8! pt-8! pb-16!">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2! text-primary-btn">My Orders</h1>
        <p className="text-sm text-gray-500 mb-6!">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-col md:flex-row gap-6!">
          {/* LEFT: Filters */}
          <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4! h-fit">
            <h2 className="text-sm font-semibold mb-4!">Filters</h2>

            {/* Status filter */}
            <div className="mb-5!">
              <p className="text-xs font-semibold text-gray-500 mb-2!">
                ORDER STATUS
              </p>
              <div className="space-y-1.5! text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="ALL"
                    checked={statusFilter === "ALL"}
                    onChange={() => setStatusFilter("ALL")}
                    className="h-3 w-3"
                  />
                  <span>All</span>
                </label>
                {STATUS_OPTIONS.map((st) => (
                  <label
                    key={st}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={st}
                      checked={statusFilter === st}
                      onChange={() => setStatusFilter(st)}
                      className="h-3 w-3"
                    />
                    <span>{st}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2!">
                ORDER TIME
              </p>
              <div className="space-y-1.5! text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="date"
                    value="ALL"
                    checked={dateFilter === "ALL"}
                    onChange={() => setDateFilter("ALL")}
                    className="h-3 w-3"
                  />
                  <span>All</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="date"
                    value="LAST_30"
                    checked={dateFilter === "LAST_30"}
                    onChange={() => setDateFilter("LAST_30")}
                    className="h-3 w-3"
                  />
                  <span>Last 30 days</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="date"
                    value="THIS_YEAR"
                    checked={dateFilter === "THIS_YEAR"}
                    onChange={() => setDateFilter("THIS_YEAR")}
                    className="h-3 w-3"
                  />
                  <span>This year</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="date"
                    value="OLDER"
                    checked={dateFilter === "OLDER"}
                    onChange={() => setDateFilter("OLDER")}
                    className="h-3 w-3"
                  />
                  <span>Older</span>
                </label>
              </div>
            </div>
          </aside>

          {/* RIGHT: Search + list */}
          <div className="flex-1 ">
            {/* Search bar */}
            <div className="flex items-center sm:w-120 gap-3 mb-4!">
              <h4 className="text-3xl  text-primary-btn font-semibold">
                search:
              </h4>
              <input
                type="text"
                placeholder="Search your orders (book title)..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 px-4! py-2.5!   rounded-full border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-btn focus:border-transparent"
              />
            </div>

            {/* Orders list */}
            {loading ? (
              <div className="text-gray-500">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12! text-center text-gray-500">
                No orders match your filters.
              </div>
            ) : (
              <div className="space-y-4!">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4! md:px-6! py-4! flex flex-col md:flex-row gap-4! md:gap-6! items-start"
                  >

                    {/* Middle: titles */}
                    <div className="flex-1 min-w-0">
                      <p className="text-md text-primary-btn font-bold mb-4!">
                        Order ID: {order._id.slice(-8)}
                      </p>
                      <p className="text-sm font-semibold truncate">
                        {order.items[0]?.title}
                      </p>
                      {order.items.length > 1 && (
                        <p className="text-xs text-gray-500 mt-0.5!">
                          + {order.items.length - 1} more item
                          {order.items.length > 2 ? "s" : ""}
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    {/* Right: status + actions */}
                    <div className="w-full md:w-64 flex flex-col items-start md:items-end gap-2!">
                      <div className="flex items-center gap-2!">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs text-gray-700">
                          {order.status === "DELIVERED"
                            ? `Delivered on ${formatDate(order.Delivery)}`
                            : order.status}
                        </span>
                      </div>
                      <span
                        className={`inline-flex px-2.5! py-0.5! rounded-full text-[11px] font-semibold ${statusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold mt-1!">
                        ₹{Number(order.totalAmount || 0).toLocaleString()}
                      </p>
                      <div className="flex gap-2! mt-1!">
                        <button
                          type="button"
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="px-3! py-1.5! rounded-full border cursor-pointer border-gray-300 text-xs font-medium hover:bg-primary-btn hover:text-white"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UOrders;
