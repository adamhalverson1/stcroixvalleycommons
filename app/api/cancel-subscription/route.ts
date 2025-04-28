import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  try {
    const { businessId, subscriptionId } = await req.json();

    if (!businessId || !subscriptionId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Cancel subscription immediately
    await stripe.subscriptions.cancel(subscriptionId);

    // Update Firestore
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      subscriptionStatus: 'inactive',
      planType: 'none', // or you can omit this line if you prefer
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CANCEL_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
