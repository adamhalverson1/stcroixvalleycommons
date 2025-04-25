import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { businessId, newPlan, currentPlan } = await req.json();

    // If no change, just send the portal link
    if (newPlan === currentPlan) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: await getStripeCustomerId(businessId),
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // Lookup business in Firestore
    const businessRef = doc(db, 'businesses', businessId);
    const businessSnap = await getDoc(businessRef);
    const business = businessSnap.data();

    if (!business || !business.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No subscription found.' }, { status: 400 });
    }

    // Update Stripe subscription
    const subscription = await stripe.subscriptions.update(
      business.stripeSubscriptionId,
      {
        items: [{
          id: (await stripe.subscriptions.retrieve(business.stripeSubscriptionId)).items.data[0].id,
          price: newPlan === 'Featured'
            ? process.env.STRIPE_FEATURED_PRICE_ID
            : process.env.STRIPE_BASIC_PRICE_ID,
        }],
        proration_behavior: 'create_prorations',
      }
    );

    // Update Firestore planType
    await updateDoc(businessRef, { planType: newPlan });

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer as string,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getStripeCustomerId(businessId: string) {
  const businessRef = doc(db, 'businesses', businessId);
  const businessSnap = await getDoc(businessRef);
  const business = businessSnap.data();
  return business?.stripeCustomerId;
}
