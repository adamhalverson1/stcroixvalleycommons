import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Initialize Firebase Admin SDK
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

// Helper to read raw body from request
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body!);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return new NextResponse('Webhook signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const businessId = session.metadata?.businessId;
    const priceId = session.metadata?.priceId;
    const plan = session.metadata?.plan ?? 'basic';

    console.log('✅ Session completed for business ID:', businessId);

    if (!businessId) {
      console.error('❌ No businessId found in metadata.');
      return new NextResponse('Missing businessId', { status: 400 });
    }

    try {
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Access current_period_end with 'as any' to avoid TS error
      const currentPeriodEndRaw = (subscription as any)['current_period_end'];

      const currentPeriodEndTimestamp = currentPeriodEndRaw
        ? Timestamp.fromDate(new Date(currentPeriodEndRaw * 1000))
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
      return new NextResponse('Firestore update failed', { status: 500 });
    }
  }

  return new NextResponse('Webhook received', { status: 200 });
}
