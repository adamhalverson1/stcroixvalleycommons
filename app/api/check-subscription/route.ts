// app/api/check-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.subscription) {
      return NextResponse.json({ error: 'No subscription found in session' }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const businessId = subscription.metadata.businessId;
    const plan = subscription.metadata.plan;
    const priceId = subscription.metadata.priceId;
    const customerId = subscription.customer as string;
    const status = subscription.status;

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId in metadata' }, { status: 400 });
    }

    await db.collection('businesses').doc(businessId).set(
      {
        subscriptionId: subscription.id,
        subscriptionStatus: status,
        plan,
        priceId,
        customerId,
        subscribedAt: Timestamp.now(),
        status: status === 'active' ? 'active' : undefined,
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, businessId, subscriptionId: subscription.id });
  } catch (err) {
    console.error('❌ Failed to verify subscription:', err);
    return NextResponse.json({ error: 'Subscription verification failed' }, { status: 500 });
  }
}
