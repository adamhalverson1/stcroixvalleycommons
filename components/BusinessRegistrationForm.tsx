'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterBusinessPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    website: '',
    category: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem('pendingBusinessImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem('pendingBusiness', JSON.stringify(form));
    router.push('/sign-up');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input className="w-full border font-bold text-center text-[#2C3E50] mb-6" name="name" onChange={handleChange} required placeholder="Business Name" />
      <input className="w-full border font-bold text-center text-[#2C3E50] mb-6" name="email" onChange={handleChange} required placeholder="Email" />
      <input className="w-full border font-bold text-center text-[#2C3E50] mb-6" name="phone" onChange={handleChange} placeholder="Phone" />
      <input className="w-full border font-bold text-center text-[#2C3E50] mb-6" name="address" onChange={handleChange} placeholder="Address" />s
      <input className="w-full border font-bold text-center text-[#2C3E50] mb-6" name="city" onChange={handleChange} placeholder="City" />
      <select
        name="state"
        value={form.state}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded font-bold text-center text-[#2C3E50] mb-6"
      >
        <option value="">Select a State</option>
        <option value="Minnesota">Minnesota</option>
        <option value="Wisconsin">Wisconsin</option>
      </select>
      <input className="w-full border font-bold text-center text-[#2C3E50] mb-6" name="website" onChange={handleChange} placeholder="Website" />
      
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded font-bold text-center text-[#2C3E50] mb-6"
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
      <input className="w-full border h-25 font-bold text-center text-[#2C3E50] mb-6" name="description" onChange={handleChange} placeholder="Business Description"  />
      
      <input className="w-full bg-[#2C3E50] text-white py-2 rounded" type="file" accept="image/*" onChange={handleImageChange} />

      <button className="w-full bg-[#2C3E50] text-white py-2 rounded hover:bg-[#1a2734]" type="submit">Continue to Plan</button>
    </form>
  );
}
