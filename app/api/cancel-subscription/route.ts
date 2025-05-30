// app/api/cancel-subscription/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Stripe from 'stripe';

export const runtime = 'edge';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  try {
    const { businessId, subscriptionId } = await req.json();

    if (!businessId || !subscriptionId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Cancel at end of billing period
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update Firestore
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      subscriptionStatus: 'cancelling', // still active until period ends
    });

    return NextResponse.json({ success: true, canceledAt: canceledSubscription.cancel_at });
  } catch (error) {
    console.error('[CANCEL_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
