import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const { name, category, email, userId } = await req.json();

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
