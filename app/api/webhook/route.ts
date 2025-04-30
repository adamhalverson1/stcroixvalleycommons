import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Only initialize Firebase once
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const businessId = session.metadata?.businessId;
    const priceId = session.metadata?.priceId;
    const plan = session.metadata?.plan ?? 'basic';

    console.log('✅ Session completed for business ID:', businessId);

    if (!businessId) {
      console.error('❌ No businessId found in metadata.');
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    try {
      // Get subscription object from Stripe
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const currentPeriodEndTimestamp = subscription.current_period_end
        ? Timestamp.fromDate(new Date(subscription.current_period_end * 1000))
        : null;

      await db.collection('businesses').doc(businessId).set(
        {
          subscriptionStatus: 'active',
          subscribedAt: Timestamp.now(),
          subscriptionId,
          customerId: session.customer as string,
          priceId,
          plan,
          ...(currentPeriodEndTimestamp && { currentPeriodEnd: currentPeriodEndTimestamp }),
        },
        { merge: true }
      );

      console.log(`✅ Firestore updated for business ${businessId}`);
    } catch (err) {
      console.error('🔥 Firestore update failed:', err);
      return NextResponse.json({ error: 'Firestore update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
