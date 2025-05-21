'use client';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import to your project structure

interface Business {
  id: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  state: string;
  website: string;
  Facebook: string;
  Twitter: string;
  Instagram: string;
  email: string;
  serviceArea: string;
  [key: string]: any;
}

interface BusinessFormProps {
  business: Business;
  setBusiness: (business: Business) => void;
}

export function BusinessForm({ business, setBusiness }: BusinessFormProps) {
  const [formData, setFormData] = useState({
    name: business.name || '',
    description: business.description || '',
    phone: business.phone || '',
    email: business.email || '',
    address: business.address || '',
    state: business.state || '',
    serviceArea: business.serviceArea || '',
    website: business.website || '',
    Facebook: business.Facebook || '',
    Twitter: business.Twitter || '',
    Instagram: business.Instagram || '',

  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, formData);
      setBusiness({ ...business, ...formData });
      setSuccessMessage('Business information updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating business:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-[#4C7C59]">Business Info</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border text-black border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 text-black p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full mt-1 text-black p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Area</label>
          <input
            type="text"
            name="serviceArea"
            value={formData.serviceArea}
            onChange={handleChange}
            className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Facebook</label>
          <input
            type="text"
            name="Facebook"
            value={formData.Facebook}
            onChange={handleChange}
            className="w-full mt-1 text-black p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Twitter</label>
          <input
            type="text"
            name="Twitter"
            value={formData.Twitter}
            onChange={handleChange}
            className="w-full mt-1 text-black p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Instagram</label>
          <input
            type="text"
            name="Instagram"
            value={formData.Instagram}
            onChange={handleChange}
            className="w-full mt-1 text-black p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#4C7C59] text-white px-4 py-2 rounded-lg hover:bg-[#3b624a] transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {successMessage && (
          <p className="text-green-600 text-sm mt-2">{successMessage}</p>
        )}
      </div>
    </form>
  );
}
