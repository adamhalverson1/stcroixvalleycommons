import Stripe from 'stripe';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

type PagesFunction<Env = any, Params = any, Data = any> = (context: {
  request: Request;
  env: Env;
  params: Params;
  data: Data;
}) => Promise<Response> | Response;


export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { businessId, priceId, plan } = await request.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        businessId,
        priceId,
        plan,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Checkout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
