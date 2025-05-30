import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Stripe from 'stripe';

export const runtime = 'edge';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Map Stripe Price IDs to Plan Names manually
const priceIdToPlanName: Record<string, string> = {
  [process.env.STRIPE_BASIC_PRICE_ID!]: 'Basic',
  [process.env.STRIPE_FEATURED_PRICE_ID!]: 'Featured',
};

export async function POST(req: Request) {
  try {
    const { businessId, subscriptionId, newPlanPriceId } = await req.json();

    if (!businessId || !subscriptionId || !newPlanPriceId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Fetch current subscription to get item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0].id;

    // Update subscription price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: itemId,
        price: newPlanPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    const selectedPlanName = priceIdToPlanName[newPlanPriceId] || 'Unknown';

    // Update Firestore
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      planType: selectedPlanName,
      subscriptionStatus: updatedSubscription.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CHANGE_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
