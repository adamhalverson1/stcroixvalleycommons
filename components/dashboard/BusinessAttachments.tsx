'use client';

import { useRef, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';

interface Business {
  id: string;
  plan?: string;
  attachments?: string[];
  [key: string]: any;
}

interface BusinessAttachmentsProps {
  business: Business;
  setBusiness: (business: Business) => void;
}

export function BusinessAttachments({ business, setBusiness }: BusinessAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const attachments = business.attachments || [];
  const maxReached = attachments.length >= 5;

  if (business.plan !== 'featured') return null; // Only show for Featured plan

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || maxReached) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `businessAttachments/${business.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        attachments: arrayUnion(url),
      });

      setBusiness({
        ...business,
        attachments: [...attachments, url],
      });
    } catch (err) {
      console.error('Attachment upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-[#4C7C59]">Business Attachments</h2>

      <ul className="mb-4 space-y-2">
        {attachments.map((url, i) => (
          <li key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {decodeURIComponent(url.split('/').pop()!.split('?')[0])}
            </a>
          </li>
        ))}
      </ul>

      {maxReached && (
        <p className="text-red-600 mb-2 text-sm">Maximum of 5 attachments reached.</p>
      )}

      <input
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={maxReached}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || maxReached}
        className={`px-4 py-2 rounded-lg transition ${
          uploading || maxReached
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-[#4C7C59] text-white hover:bg-[#3b624a]'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload Attachment'}
      </button>
    </div>
  );
}
