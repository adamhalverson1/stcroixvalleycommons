'use client';

import { useRef, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase'; // adjust based on your structure

interface Business {
  id: string;
  imageUrl?: string;
  [key: string]: any;
}

interface BusinessImageProps {
  business: Business;
  setBusiness: (business: Business) => void;
}

export function BusinessImage({ business, setBusiness }: BusinessImageProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `businessImages/${business.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, { imageUrl: url });
      setBusiness({ ...business, imageUrl: url });
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 text-[#4C7C59]">Business Image</h2>

      {business.imageUrl ? (
        <img
          src={business.imageUrl}
          alt="Business"
          className="w-32 h-32 object-cover rounded-full mb-4"
        />
      ) : (
        <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="bg-[#4C7C59] text-white px-4 py-2 rounded-lg hover:bg-[#3b624a] transition"
      >
        {uploading ? 'Uploading...' : 'Upload New Image'}
      </button>
    </div>
  );
}
