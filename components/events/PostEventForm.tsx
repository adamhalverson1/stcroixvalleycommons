'use client';

import { useState, useEffect } from 'react';
import {
  addDoc,
  collection,
  Timestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/uploadImage'; // utility to upload to Firebase Storage

// Slugify helper
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  const eventsRef = collection(db, 'events');
  let existing = await getDocs(query(eventsRef, where('slug', '==', slug)));

  while (!existing.empty) {
    slug = `${baseSlug}-${counter++}`;
    existing = await getDocs(query(eventsRef, where('slug', '==', slug)));
  }

  return slug;
}

type Props = {
  businessId: string;
  plan: 'basic' | 'featured';
};

export default function PostEventForm({ businessId, plan }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPostingEligibility = async () => {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const eventsRef = collection(db, 'events');
      const businessQuery = query(
        eventsRef,
        where('businessId', '==', businessId)
      );

      const snapshot = await getDocs(businessQuery);
      const eventsThisMonth = snapshot.docs.filter((doc) => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return (
          createdAt &&
          createdAt >= startOfMonth &&
          createdAt <= endOfMonth
        );
      });

      setCanPost(eventsThisMonth.length === 0);
      setLoading(false);
    };

    checkPostingEligibility();
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image, `events/${businessId}_${Date.now()}`);
      }

      const slug = await generateUniqueSlug(title);

      await addDoc(collection(db, 'events'), {
        businessId,
        title,
        slug,
        description,
        date,
        time,
        location,
        imageUrl,
        isFeatured: plan === 'featured',
        createdAt: Timestamp.now(),
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setImage(null);
    } catch (err) {
      console.error('Error creating event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded">
      <h2 className="text-xl font-semibold text-[#4C7C59]">Post an Event</h2>

      {loading ? (
        <p className="text-gray-600">Checking posting eligibility...</p>
      ) : !canPost ? (
        <p className="text-red-600 font-medium">
          You have already posted an event this month. You may post again next month.
        </p>
      ) : (
        <>
          {success && <p className="text-green-600">Event posted successfully!</p>}

          <input
            type="text"
            placeholder="Event Title"
            className="w-full text-black p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Event Description"
            className="w-full text-black p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="flex gap-4">
            <input
              type="date"
              className="w-1/2 text-black p-2 border rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <input
              type="time"
              className="w-1/2 p-2 text-black border rounded"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Location"
            className="w-full p-2 text-black border rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <button
            type="submit"
            className="px-4 py-2 bg-[#4C7C59] text-white rounded hover:bg-[#3a6349]"
            disabled={submitting}
          >
            {submitting ? 'Posting...' : plan === 'featured' ? 'Post Featured Event' : 'Post Event'}
          </button>
        </>
      )}
    </form>
  );
}
