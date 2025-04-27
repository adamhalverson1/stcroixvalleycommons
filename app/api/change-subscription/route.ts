// /api/change-subscription/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  try {
    const { businessId, subscriptionId, newPlanPriceId } = await req.json();

    if (!businessId || !subscriptionId || !newPlanPriceId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Update subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
        price: newPlanPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    // Update business document in Firestore
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      planType: updatedSubscription.items.data[0].price.nickname,
      subscriptionStatus: updatedSubscription.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CHANGE_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
