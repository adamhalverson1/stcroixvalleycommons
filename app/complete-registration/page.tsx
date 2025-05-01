'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from "firebase/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Submitting...');

  useEffect(() => {
    const submitData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setStatus('User not signed in.');
        return;
      }

      const storedForm = localStorage.getItem('pendingBusiness');
      const storedImage = localStorage.getItem('pendingBusinessImage');

      if (!storedForm) {
        setStatus('No business data found.');
        return;
      }

      const form = JSON.parse(storedForm);
      const baseSlug = slugify(form.name);
      let slug = baseSlug;
      let counter = 1;
      
      console.log("Checking slug uniqueness starting with:", baseSlug);
      
      // Ensure unique slug
      while ((await getDoc(doc(db, 'businesses', slug))).exists()) {
        console.log(`Slug "${slug}" already exists. Trying next...`);
        slug = `${baseSlug}-${counter++}`;
      }
      
      console.log("Final slug to be used:", slug);
      
      try {
        await setDoc(doc(db, 'businesses', slug), {
          ...form,
          userId: user.uid, // Make sure this is Firebase auth user, not Clerk
          slug,
          createdAt: serverTimestamp(),
        });
      
        console.log("Successfully saved business with slug:", slug);
      
        if (storedImage) {
          const imageBlob = await (await fetch(storedImage)).blob();
          const imageRef = ref(storage, `businesses/${slug}/image.jpg`);
          await uploadBytes(imageRef, imageBlob);
          console.log("Uploaded business image");
        }
      
        localStorage.removeItem('pendingBusiness');
        localStorage.removeItem('pendingBusinessImage');
      
        setStatus('✅ Business successfully registered.');
        router.push(`/dashboard/${slug}`);
      } catch (err) {
        console.error("Error saving business:", err);
        setStatus('❌ Failed to register business.');
      }
      
    };

    submitData();
  }, [router]);

  return <p className="text-center mt-10">{status}</p>;
}
