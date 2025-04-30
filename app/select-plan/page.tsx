'use client';

export default function SelectPlanPage() {
  const handleSubscribe = async (priceId: string, plan: string) => {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) return alert('Missing business ID');

    const res = await fetch('/api/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, priceId, plan }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to start checkout');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <button onClick={() => handleSubscribe('price_1REuzXKabuDj6Ug3So8O4OSY', 'basic')}>
        Basic Plan - $10/mo
      </button>
      <button onClick={() => handleSubscribe('price_1REuzvKabuDj6Ug30bfZ2sDL', 'featured')}>
        Featured Plan - $25/mo
      </button>
    </div>
  );
}
