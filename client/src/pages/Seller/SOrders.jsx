// SOrders.jsx
import React, { useEffect, useState, useContext } from "react";
import SNavBar from "../../components/SellerComponents/SNavBar.jsx";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { getBookImage } from "../../utils/imageHelper.js";

const SOrders = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}api/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) => statusFilter === "all" || order.status === statusFilter
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    // Prevent no-change updates
    const order = orders.find((o) => o._id === orderId);
    if (order.status === newStatus) return;

    try {
      await axios.patch(
        `${backendUrl}api/seller/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.log(err);
      toast.error("Failed to update status");
    }
  };


  useEffect(() => {
    loadOrders();
  }, []);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-emerald-100 text-emerald-800",
    SHIPPED: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-rose-100 text-rose-800",
  };

  return (
    <section className="min-h-screen bg-green-100">
      <SNavBar />

      <div className="pt-16! flex justify-center">
        <div className="w-[95%] max-w-7xl bg-white rounded-2xl shadow-md border border-teal-100 px-6! md:px-10! py-8!">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6! mb-8!">
            <div>
              <h1 className="text-3xl font-bold text-teal-700 mb-2!">
                My Orders
              </h1>
              <p className="text-gray-600">
                Manage orders from customers ({orders.length} total)
              </p>
            </div>
            <div className="flex gap-3!">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4! py-2! border border-teal-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-teal-50 rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-16! text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4!"></div>
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-16! text-center">
                  <div className="w-24! h-24! bg-gray-200 rounded-2xl mx-auto mb-4! flex items-center justify-center">
                    <span className="text-3xl">📦</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-500 mb-2!">
                    No orders yet
                  </h3>
                  <p className="text-gray-400 mb-6!">
                    Orders will appear here when customers purchase your books.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-teal-100">
                  <thead className="bg-teal-50">
                    <tr>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8! py-4! text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6! py-4! text-center text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-100 bg-white">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-teal-50/50 transition-colors"
                      >
                        {/* Order ID */}
                        <td className="px-6! py-4! font-mono text-sm text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>

                        {/* Customer */}
                        <td className="px-6! py-4!">
                          <div className="font-medium text-gray-900">
                            {order.userId?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.userId?.email ||
                              order.shippingAddress?.phone}
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.pincode}
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-6! py-4!">
                          <div className="flex flex-col gap-2! max-w-xs">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3!"
                              >
                                <img
                                  src={getBookImage(
                                    item.bookId?.itemImage || item.itemImage
                                  )}
                                  alt={item.title}
                                  className="w-10! h-14! object-cover rounded shadow-sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate">
                                    {item.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ₹{item.price} × {item.quantity}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{order.items.length - 3} more items
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-6! py-4! whitespace-nowrap">
                          <div className="text-2xl font-bold text-teal-600">
                            ₹{Number(order.totalAmount).toLocaleString()}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6! py-4! whitespace-nowrap">
                          <span
                            className={`px-3! py-1! rounded-full text-sm font-semibold ${
                              statusColors[order.status]
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6! py-4! whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6! py-4! text-center">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className="px-3! py-1.5! border border-teal-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white hover:border-teal-500 transition-colors"
                            disabled={
                              order.status === "DELIVERED" ||
                              order.status === "CANCELLED"
                            }
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SOrders;
