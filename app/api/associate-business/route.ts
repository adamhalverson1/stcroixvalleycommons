// app/api/associate-business/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, category, email, userId } = data;

  if (!userId || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const newBusinessRef = db.collection('businesses').doc();
    await newBusinessRef.set({
      name,
      category,
      email,
      userId,
      createdAt: Timestamp.now(),
      subscriptionStatus: 'pending',
    });

    return NextResponse.json({ status: 'ok', id: newBusinessRef.id });
  } catch (err) {
    console.error('Error saving business:', err);
    return NextResponse.json({ error: 'Failed to save business' }, { status: 500 });
  }
}
