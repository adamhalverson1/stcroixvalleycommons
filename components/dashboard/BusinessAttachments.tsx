'use client';

import { useRef, useState } from 'react';
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';

interface Attachment {
  name: string;
  url: string;
}

interface Business {
  id: string;
  plan?: string;
  attachments?: (string | Attachment)[];
  [key: string]: any;
}

interface BusinessAttachmentsProps {
  business: Business;
  setBusiness: (business: Business) => void;
}

export function BusinessAttachments({ business, setBusiness }: BusinessAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const attachments = (business.attachments || []) as Attachment[];
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

      const attachment: Attachment = {
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        url,
      };

      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        attachments: arrayUnion(attachment),
      });

      setBusiness({
        ...business,
        attachments: [...attachments, attachment],
      });
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

    const updatedAttachment = { ...current, name: renameValue.trim() };

    try {
      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        attachments: arrayRemove(current),
      });
      await updateDoc(businessRef, {
        attachments: arrayUnion(updatedAttachment),
      });

      const newList = [...attachments];
      newList[index] = updatedAttachment;
      setBusiness({
        ...business,
        attachments: newList,
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
        {attachments.map((attachment, i) => (
          <li key={i} className="flex items-center gap-2">
            <a
              href={typeof attachment === 'string' ? attachment : attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {renamingIndex === i ? (
                <input
                  className="border border-gray-300 px-2 py-1 rounded text-sm"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />
              ) : (
                <span>{typeof attachment === 'string'
                  ? decodeURIComponent(attachment.split('/').pop()!.split('?')[0])
                  : attachment.name}</span>
              )}
            </a>

            {renamingIndex === i ? (
              <button
                onClick={() => handleRename(i)}
                className="text-green-600 hover:underline text-sm"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => {
                  setRenamingIndex(i);
                  setRenameValue(attachment.name);
                }}
                className="text-gray-500 hover:underline text-sm"
              >
                Rename
              </button>
            )}

            {renamingIndex === i && (
              <button
                onClick={() => {
                  setRenamingIndex(null);
                  setRenameValue('');
                }}
                className="text-red-500 hover:underline text-sm ml-1"
              >
                Cancel
              </button>
            )}
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
