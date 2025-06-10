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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.businessId;
        const priceId = session.metadata?.priceId;
        const plan = session.metadata?.plan ?? 'Basic';

        if (!businessId) {
          console.warn('⚠️ Missing businessId in checkout.session.completed');
          break;
        }

        // Retrieve subscription ID from session (string or null)
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;

        let subscriptionStatus = 'pending';
        let customerId: string | null = null;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            subscriptionStatus = subscription.status;
            customerId = subscription.customer as string | null;
          } catch (err) {
            console.error('❌ Failed to retrieve subscription on checkout.session.completed:', err);
          }
        }

        try {
          await db.collection('businesses').doc(businessId).update({
            plan,
            priceId,
            subscriptionId: subscriptionId ?? null,
            subscriptionStatus,
            customerId,
            subscribedAt: subscriptionStatus === 'active' ? Timestamp.now() : null,
            status: subscriptionStatus === 'active' ? 'active' : subscriptionStatus,
          });
          console.log(`✅ checkout.session.completed processed for business ${businessId}`);
        } catch (err) {
          console.error('❌ Failed to update business after checkout.session.completed:', err);
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
          await db.collection('businesses').doc(businessId).update({
            subscriptionId,
            subscriptionStatus,
            customerId,
            subscribedAt: Timestamp.now(),
            plan: metadata.plan ?? undefined,
            priceId: metadata.priceId ?? undefined,
            status: subscriptionStatus === 'active' ? 'active' : subscriptionStatus,
          });
          console.log(`✅ Subscription status ${subscriptionStatus} updated for business ${businessId}`);
        } catch (err) {
          console.error('❌ Failed to update subscription info:', err);
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId || typeof subscriptionId !== 'string') {
          console.warn('⚠️ Invoice missing subscription ID');
          break;
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const subscriptionStatus = subscription.status;
          const customerId = subscription.customer as string;
          const metadata = subscription.metadata || {};
          const businessId = metadata.businessId;

          if (!businessId) {
            console.warn('⚠️ Missing businessId in subscription metadata on invoice.payment_succeeded');
            break;
          }

          await db.collection('businesses').doc(businessId).update({
            subscriptionId,
            subscriptionStatus,
            customerId,
            subscribedAt: Timestamp.now(),
            plan: metadata.plan ?? undefined,
            priceId: metadata.priceId ?? undefined,
            status: subscriptionStatus === 'active' ? 'active' : subscriptionStatus,
          });

          console.log(`✅ Invoice payment processed: ${subscriptionStatus} for business ${businessId}`);
        } catch (err) {
          console.error('❌ Failed to update business on invoice.payment_succeeded:', err);
        }

        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('🔥 Error handling webhook event:', err);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse('Webhook processed', { status: 200 });
}
