// components/BusinessRegistrationForm.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function BusinessRegistrationForm() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    email: "",
    website: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "businesses"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setForm({ name: "", category: "", email: "", website: "", phone:"", address: "", city: "", state:"" });
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return <p>✅ Business registered successfully!</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto py-4 text-[#7DA195]">
      <input
        name="name"
        placeholder="Business Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Select Category</option>
        <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
        <option value="Food & Beverage">Food & Beverage</option>
        <option value="Professional Services">Professional Services</option>
        <option value="Health & Wellness">Health & Wellness</option>
        <option value="Education & Training">Education & Training</option>
        <option value="Technology & IT">Technology & IT</option>
        <option value="Finance & Insurance">Finance & Insurance</option>
        <option value="Automotive">Automotive</option>
        <option value="Home Services">Home Services</option>
        <option value="Arts, Entertainment & Recreation">Arts, Entertainment & Recreation</option>
        <option value="Logistics & Transportation">Logistics & Transportation</option>
        <option value="Pets & Animals">Pets & Animals</option>
      </select>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="phone"
        type="phone"
        placeholder="Business Phone Number"
        value={form.phone}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="address"
        type="address"
        placeholder="Business Address"
        value={form.address}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="city"
        type="city"
        placeholder="Business City"
        value={form.city}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="state"
        type="state"
        placeholder="Business State"
        value={form.state}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="website"
        type="url"
        placeholder="Website (optional)"
        value={form.website}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded "
      >
        {loading ? "Submitting..." : "Register Business"}
      </button>
    </form>
  );
}
