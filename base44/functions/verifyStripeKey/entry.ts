import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const secretKey = (body.secret_key || '').trim();
    if (!secretKey) return Response.json({ error: 'secret_key is required' }, { status: 400 });

    const res = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Stripe-Version': '2025-10-29.clover',
      },
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return Response.json({
        valid: false,
        error: data?.error?.message || 'Invalid or unauthorized Stripe API key',
      });
    }

    return Response.json({
      valid: true,
      livemode: data.livemode === true,
      account_id: data.id,
      country: data.country,
      default_currency: data.default_currency,
      business_name: data.business_name || data.display_name || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}