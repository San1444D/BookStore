// pages/User/UProfile.jsx
import React, { useContext, useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const UProfile = () => {
  const { backendUrl, token, user } = useContext(AppContext);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    flatno: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        email: data.email || "",
        phone: data.phone || "",
        flatno: data.addressFlatno || "",
        pincode: data.addressPincode || "",
        city: data.addressCity || "",
        state: data.addressState || "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(`${backendUrl}api/user/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-primary-home">
      <NavBar />

      <div className="max-w-xl mx-auto! px-4! md:px-8! pt-8! pb-16!">
        <h1 className="text-2xl text-center md:text-3xl font-semibold mb-2!">My Profile</h1>
        <p className="text-sm text-center text-gray-500 mb-6!">Signed in as {user?.name}</p>

        {loading ? (
          <div className="text-gray-500">Loading profile...</div>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6! space-y-4!"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1!">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-primary-btn"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1!">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-primary-btn"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1!">
                Flat / Street
              </label>
              <input
                type="text"
                name="flatno"
                value={form.flatno}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-primary-btn"
              />
            </div>

            <div className="grid grid-cols-2 gap-3!">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1!">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-primary-btn"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1!">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-primary-btn"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1!">
                State
              </label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3! py-2! text-sm focus:outline-none focus:ring-2 focus:ring-primary-btn"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2! w-full py-2.5! rounded-full bg-primary-btn cursor-pointer text-white text-sm font-semibold hover:bg-primary-btn-hover disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <p className="text-[11px] text-gray-500 mt-2!">
              This address will be used as your default shipping address for
              orders.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default UProfile;
