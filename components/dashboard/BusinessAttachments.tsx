'use client';

import React, { useRef, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { Business, Attachment } from '@/types/business';

interface BusinessAttachmentsProps {
  business: Business;
  setBusiness: React.Dispatch<React.SetStateAction<Business>>;
  refreshBusiness: () => Promise<void>;
}

export function BusinessAttachments({ business, setBusiness, refreshBusiness }: BusinessAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Normalize attachments into Attachment[] with guaranteed string 'name'
  const attachments: Attachment[] = (business.attachments || []).map(a =>
    typeof a === 'string'
      ? { name: decodeURIComponent(a.split('/').pop()!.split('?')[0]), url: a }
      : {
          name: a.name ?? '', // fallback empty string if optional name missing
          url: a.url,
          type: a.type,
        }
  );

  const maxReached = attachments.length >= 5;

  if (business.plan !== 'featured') return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || maxReached) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `businessAttachments/${business.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const newAttachment: Attachment = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        url,
      };

      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        attachments: arrayUnion(newAttachment),
      });
      await refreshBusiness();

      setBusiness(prev => ({
        ...prev,
        attachments: [...attachments, newAttachment],
      }));
    } catch (err) {
      console.error('Attachment upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRename = async (index: number) => {
  const current = attachments[index];
  if (!renameValue.trim() || !current) return;

  // Ensure all fields are explicitly defined (no undefineds)
  const cleanedCurrent: Attachment = {
    name: current.name ?? '',
    url: current.url,
    ...(current.type ? { type: current.type } : {}), // include type only if it exists
  };

  const updated: Attachment = {
    ...cleanedCurrent,
    name: renameValue.trim(),
  };

  const businessRef = doc(db, 'businesses', business.id);

  try {
    await updateDoc(businessRef, {
      attachments: arrayRemove(cleanedCurrent),
    });
    await updateDoc(businessRef, {
      attachments: arrayUnion(updated),
    });

    setBusiness(prev => {
      const updatedList = [...attachments];
      updatedList[index] = updated;
      return { ...prev, attachments: updatedList };
    });

    setRenamingIndex(null);
    setRenameValue('');
  } catch (err) {
    console.error('Rename failed:', err);
  }
};

  return (
    <div className="bg-white p-6 rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-[#4C7C59]">Business Attachments</h2>

      <ul className="mb-4 space-y-4">
        {attachments.map((att, i) => (
          <li key={i} className="flex items-center gap-2">
            {renamingIndex === i ? (
              <input
                className="border border-gray-300 px-2 py-1 rounded text-sm text-black"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
              />
            ) : (
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {att.name}
              </a>
            )}

            {renamingIndex === i ? (
              <>
                <button onClick={() => handleRename(i)} className="text-green-600 hover:underline text-sm">
                  Save
                </button>
                <button
                  onClick={() => {
                    setRenamingIndex(null);
                    setRenameValue('');
                  }}
                  className="text-red-500 hover:underline text-sm ml-1"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setRenamingIndex(i);
                  setRenameValue(att.name ?? '');
                }}
                className="text-gray-500 hover:underline text-sm"
              >
                Rename
              </button>
            )}
          </li>
        ))}
      </ul>

      {maxReached && <p className="text-red-600 mb-2 text-sm">Maximum of 5 attachments reached.</p>}

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
