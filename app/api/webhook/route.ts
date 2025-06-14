import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Received checkout.session.completed event');

        const businessId = session.metadata?.businessId;
        const plan = session.metadata?.plan ?? 'basic';
        const priceId = session.metadata?.priceId;

        if (!businessId) {
          console.warn('⚠️ Missing businessId in session metadata');
          break;
        }

        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
        if (!subscriptionId) {
          console.warn('⚠️ No subscription ID found in session');
          break;
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const subscriptionStatus = subscription.status;
          const customerId = subscription.customer as string;
          const subscribedAt = new Date(subscription.start_date * 1000);

          const businessRef = db.collection('businesses').doc(businessId);
          const docSnapshot = await businessRef.get();

          const updateData: any = {
            subscriptionId,
            subscriptionStatus,
            customerId,
            priceId,
            plan,
            status: subscriptionStatus === 'active' ? 'active' : subscriptionStatus,
          };

          if (!docSnapshot.exists || !docSnapshot.data()?.subscribedAt) {
            updateData.subscribedAt = Timestamp.fromDate(subscribedAt);
          }

          await businessRef.update(updateData);
          console.log(`✅ Firestore updated for business ${businessId}`);
        } catch (err) {
          console.error('❌ Failed to fetch subscription or update Firestore:', err);
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const subscriptionStatus = subscription.status;
        const customerId = subscription.customer as string;
        const metadata = subscription.metadata || {};
        const businessId = metadata.businessId;

        if (!businessId) {
          console.warn(`⚠️ Missing businessId in subscription metadata`);
          break;
        }

        try {
          await db.collection('businesses').doc(businessId).set(
            {
              subscriptionId,
              subscriptionStatus,
              customerId,
              subscribedAt: Timestamp.now(),
              plan: metadata.plan ?? undefined,
              priceId: metadata.priceId ?? undefined,
              status: subscriptionStatus === 'active' ? 'active' : subscriptionStatus,
            },
            { merge: true }
          );
          console.log(`✅ Subscription ${event.type} updated for business ${businessId}`);
        } catch (err) {
          console.error('❌ Failed to update business from subscription event:', err);
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string };
        };

        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!subscriptionId) {
          console.warn('⚠️ Missing subscription ID in invoice');
          break;
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const subscriptionStatus = subscription.status;
          const customerId = subscription.customer as string;
          const metadata = subscription.metadata || {};
          const businessId = metadata.businessId;

          if (!businessId) {
            console.warn('⚠️ Missing businessId in subscription metadata during invoice.payment_succeeded');
            break;
          }

          await db.collection('businesses').doc(businessId).set(
            {
              subscriptionId,
              subscriptionStatus,
              customerId,
              subscribedAt: Timestamp.now(),
              plan: metadata.plan ?? undefined,
              priceId: metadata.priceId ?? undefined,
              status: subscriptionStatus === 'active' ? 'active' : subscriptionStatus,
            },
            { merge: true }
          );

          console.log(`✅ Invoice payment succeeded for business ${businessId}`);
        } catch (err) {
          console.error('❌ Failed to handle invoice.payment_succeeded:', err);
        }

        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('🔥 Unexpected error in webhook handler:', err);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse('Webhook processed', { status: 200 });
}
