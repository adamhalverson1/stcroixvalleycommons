"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessRegistrationForm() {
  const router = useRouter();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Store form data in localStorage
    localStorage.setItem("pendingBusiness", JSON.stringify(form));

    // Redirect to Clerk sign-up (with callback to complete registration)
    router.push("/sign-up?redirect_url=/complete-registration");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto py-4">
      <input name="name" placeholder="Business Name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
      <select name="category" value={form.category} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
        <option value="">Select Category</option>
        <option value="Retail">Retail</option>
        <option value="Food">Food</option>
        <option value="Services">Services</option>
        {/* Add more options as needed */}
      </select>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
      <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
      <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
      <input name="website" type="url" placeholder="Website" value={form.website} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Next: Create Account</button>
    </form>
  );
}
