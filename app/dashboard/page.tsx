'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  plan?: string; // "basic" or "featured"
  categories?: string[];
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

  const [selectedCategories, setSelectedCategories] = useState<string[]>(business.categories || []);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categoryOptions = [
    'Retail & Consumer Goods',
    'Food & Beverage',
    'Health & Wellness',
    'Home Services',
    'Professional Services',
    'Arts, Entertainment & Recreation',
    'Automotive',
    'Education & Training',
    'Technology & IT',
    'Finance & Insurance',
    'Logistics & Transportation',
    'Pets & Animals',
    'Other',
  ];

  const maxCategories = business.plan === 'featured' ? 3 : 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const businessRef = doc(db, 'businesses', business.id);
      const updateData: any = {
        ...formData,
        categories: selectedCategories,
      };

      await updateDoc(businessRef, updateData);
      setBusiness({ ...business, ...formData, categories: selectedCategories });
      setSuccessMessage('Business information updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating business:', err);
      setErrorMessage('Failed to update business info. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      if (selectedCategories.length < maxCategories) {
        setSelectedCategories([...selectedCategories, category]);
      }
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-[#4C7C59]">Business Info</h2>

      <div className="space-y-4">
        {[
          { label: 'Business Name', name: 'name' },
          { label: 'Description', name: 'description', type: 'textarea' },
          { label: 'Phone Number', name: 'phone' },
          { label: 'Email', name: 'email' },
          { label: 'Address', name: 'address' },
          // State changed to select below
          { label: 'Service Area', name: 'serviceArea' },
          { label: 'Website', name: 'website' },
          { label: 'Facebook', name: 'Facebook' },
          { label: 'Twitter', name: 'Twitter' },
          { label: 'Instagram', name: 'Instagram' },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {type === 'textarea' ? (
              <textarea
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                rows={3}
                className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <input
                type="text"
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
              />
            )}
          </div>
        ))}

        {/* State select */}
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full text-black mt-1 p-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select State</option>
            <option value="Minnesota">Minnesota</option>
            <option value="Wisconsin">Wisconsin</option>
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Categories ({selectedCategories.length}/{maxCategories})
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryOptions.map((category) => (
              <label key={category} className="flex items-center space-x-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={(e) =>
                    handleCategoryChange(category, e.target.checked)
                  }
                  disabled={
                    !selectedCategories.includes(category) &&
                    selectedCategories.length >= maxCategories
                  }
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#4C7C59] text-white px-4 py-2 rounded-lg hover:bg-[#3b624a] transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {successMessage && (
          <p className="text-green-600 text-sm mt-2">{successMessage}</p>
        )}

        {errorMessage && (
          <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
        )}
      </div>
    </form>
  );
}
