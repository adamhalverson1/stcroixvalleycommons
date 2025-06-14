// /app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { businessId, plan } = await req.json();

    // Validate required fields
    if (!businessId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId or plan' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate plan value explicitly
    const validPlans = ['basic', 'featured'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const priceId =
      plan === 'featured'
        ? process.env.NEXT_PUBLIC_STRIPE_FEATURED_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing Stripe price ID for selected plan' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe Checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
      metadata: {
        businessId,
        plan,
        priceId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create Stripe checkout session URL' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update Firestore with pending subscription status & intended plan
    await updateDoc(doc(db, 'businesses', businessId), {
      plan,
      subscriptionStatus: 'pending',
    });

    return NextResponse.json(
      { url: session.url },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Stripe Checkout Session Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
