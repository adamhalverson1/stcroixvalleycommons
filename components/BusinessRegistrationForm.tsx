// app/register-business/page.tsx

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
    router.push('/complete-business');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input name="name" onChange={handleChange} required placeholder="Business Name" />
      <input name="email" onChange={handleChange} required placeholder="Email" />
      <input name="phone" onChange={handleChange} placeholder="Phone" />
      <input name="address" onChange={handleChange} placeholder="Address" />
      <input name="city" onChange={handleChange} placeholder="City" />
      <input name="state" onChange={handleChange} placeholder="State" />
      <input name="website" onChange={handleChange} placeholder="Website" />
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

      <input type="file" accept="image/*" onChange={handleImageChange} />

      <button type="submit">Continue to Plan</button>
    </form>
  );
}
