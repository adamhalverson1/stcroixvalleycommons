import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

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

  console.log('📩 Stripe Webhook Event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // Do NOT update Firestore here — metadata is unreliable in this event
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Checkout completed for session ${session.id}, businessId: ${session.metadata?.businessId}`);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata || {};
        const businessId = metadata.businessId;

        if (!businessId) {
          console.warn('⚠️ Missing businessId in subscription metadata');
          break;
        }

        await db.collection('businesses').doc(businessId).set(
          {
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            customerId: subscription.customer as string,
            subscribedAt: Timestamp.now(),
            ...(metadata.plan && { plan: metadata.plan }),
            ...(metadata.priceId && { priceId: metadata.priceId }),
          },
          { merge: true }
        );

        console.log(`✅ Subscription event processed for business ${businessId}.`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };

        const subscriptionId = invoice.subscription;
          if (!subscriptionId) {
            console.warn('⚠️ Invoice missing subscription ID');
            break;
          }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const metadata = subscription.metadata || {};
        const businessId = metadata.businessId;

        if (!businessId) {
          console.warn('⚠️ Missing businessId in subscription metadata (invoice.payment_succeeded)');
          break;
        }

        await db.collection('businesses').doc(businessId).set(
          {
            subscriptionId,
            subscriptionStatus: subscription.status,
            customerId: subscription.customer as string,
            subscribedAt: Timestamp.now(),
            ...(metadata.plan && { plan: metadata.plan }),
            ...(metadata.priceId && { priceId: metadata.priceId }),
          },
          { merge: true }
        );

        console.log(`✅ Invoice payment succeeded processed for business ${businessId}.`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error('🔥 Error processing webhook event:', err);
    return new NextResponse('Webhook handler error', { status: 500 });
  }

  return new NextResponse('Webhook received', { status: 200 });
}
