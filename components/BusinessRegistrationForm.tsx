'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    hours: daysOfWeek.reduce((acc, day) => {
      acc[day] = { open: '', close: '' };
      return acc;
    }, {} as Record<string, { open: string; close: string }>),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setForm({
      ...form,
      hours: {
        ...form.hours,
        [day]: {
          ...form.hours[day],
          [field]: value,
        },
      },
    });
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-center text-[#2C3E50]">Register Your Business</h2>

      <input className="w-full border rounded px-4 py-2 text-[#2C3E50]" name="name" onChange={handleChange} required placeholder="Business Name" />
      <input className="w-full border rounded px-4 py-2 text-[#2C3E50]" name="email" onChange={handleChange} required placeholder="Email" />
      <input className="w-full border rounded px-4 py-2 text-[#2C3E50]" name="phone" onChange={handleChange} placeholder="Phone" />
      <input className="w-full border rounded px-4 py-2 text-[#2C3E50]" name="address" onChange={handleChange} placeholder="Address" />
      <input className="w-full border rounded px-4 py-2 text-[#2C3E50]" name="city" onChange={handleChange} placeholder="City" />

      <select
        name="state"
        value={form.state}
        onChange={handleChange}
        required
        className="w-full border rounded px-4 py-2 text-[#2C3E50]"
      >
        <option value="">Select a State</option>
        <option value="Minnesota">Minnesota</option>
        <option value="Wisconsin">Wisconsin</option>
      </select>

      <input className="w-full border rounded px-4 py-2 text-[#2C3E50]" name="website" onChange={handleChange} placeholder="Website" />

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full border rounded px-4 py-2 text-[#2C3E50]"
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

      <textarea
        className="w-full border rounded px-4 py-2 text-[#2C3E50]"
        name="description"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Business Description"
        rows={4}
      />

      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 text-center">Business Hours</h3>
        <div className="space-y-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center justify-between gap-4">
              <span className="w-1/4 font-medium text-[#2C3E50]">{day}</span>
              <input
                type="time"
                value={form.hours[day].open}
                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                className="w-full border rounded px-2 py-1 text-[#2C3E50]"
              />
              <span className="text-sm text-[#2C3E50]">to</span>
              <input
                type="time"
                value={form.hours[day].close}
                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                className="w-full border rounded px-2 py-1 text-[#2C3E50]"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium text-[#2C3E50]">Upload Business Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border rounded px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#2C3E50] file:text-white hover:file:bg-[#1a2734]"
        />
      </div>

      <button
        className="w-full bg-[#2C3E50] text-white font-semibold py-3 rounded-lg transition-colors hover:bg-[#1a2734]"
        type="submit"
      >
        Continue to Plan
      </button>
    </form>
  );
}
