// app/api/resubscribe/route.ts

import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', 
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, priceId } = body;

    if (!businessId || !priceId) {
      return new Response(JSON.stringify({ error: 'Missing businessId or priceId' }), {
        status: 400,
      });
    }

    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    const businessData = businessDoc.data();

    if (!businessData?.stripeCustomerId) {
      return new Response(JSON.stringify({ error: 'Missing stripeCustomerId' }), {
        status: 400,
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: businessData.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[RESUBSCRIBE_ERROR]', error);
    return new Response(JSON.stringify({ error: 'Resubscribe failed' }), {
      status: 500,
    });
  }
}
