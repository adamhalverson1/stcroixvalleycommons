import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Fetch business by userId
    const businessesRef = collection(db, 'businesses');
    const q = query(businessesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessDoc = snapshot.docs[0];
    const businessData = businessDoc.data();
    const stripeSubscriptionId = businessData.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No Stripe subscription found' }, { status: 400 });
    }

    // Cancel subscription
    await stripe.subscriptions.del(stripeSubscriptionId);

    // Update Firestore
    const businessRef = doc(db, 'businesses', businessDoc.id);
    await updateDoc(businessRef, {
      planType: '',
      stripeSubscriptionId: '', // Clear out the subscription ID too
      stripeSubscriptionItemId: '',
    });

    return NextResponse.json({ message: 'Subscription canceled successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
