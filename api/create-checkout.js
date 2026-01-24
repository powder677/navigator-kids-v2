// api/create-checkout.js
// Vercel Serverless Function for Stripe Checkout

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map your product IDs to Stripe Price IDs
const PRICE_MAP = {
  // Toolkits - $29 each
  'toolkit-emotional': 'price_1St78LAx6JDn4AuAqFqKmw3T',
  'toolkit-iep': 'price_1St78uAx6JDn4AuAhOH27Fbs',
  'toolkit-homework': 'price_1St79XAx6JDn4AuAp9ltEfNs',
  
  // Complete Bundle - $67
  'bundle-complete': 'price_1St7A4Ax6JDn4AuAKnk66CbV',
  
  // AI Prompt Packs - $19 each (all map to same product for now)
  'prompts-meltdown': 'price_1St7AnAx6JDn4AuAXsfJWw2B',
  'prompts-homework': 'price_1St7AnAx6JDn4AuAXsfJWw2B',
  'prompts-iep': 'price_1St7AnAx6JDn4AuAXsfJWw2B',
  'prompts-social': 'price_1St7AnAx6JDn4AuAXsfJWw2B',
  'prompts-morning': 'price_1St7AnAx6JDn4AuAXsfJWw2B',
  'prompts-anxiety': 'price_1St7AnAx6JDn4AuAXsfJWw2B',
  
  // Activity Packets - $9 each (all map to same product for now)
  'activity-intense-feeler': 'price_1St7BMAx6JDn4AuA1rqRIFyg',
  'activity-reluctant-starter': 'price_1St7BMAx6JDn4AuA1rqRIFyg',
  'activity-deep-diver': 'price_1St7BMAx6JDn4AuA1rqRIFyg',
};

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customerEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Convert cart items to Stripe line items
    const lineItems = items.map(item => {
      const priceId = PRICE_MAP[item.id];
      
      if (!priceId || priceId.includes('REPLACE')) {
        throw new Error(`Invalid product ID or price not configured: ${item.id}`);
      }

      return {
        price: priceId,
        quantity: item.quantity || 1,
      };
    });

    // Create Stripe Checkout Session
    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${req.headers.origin || 'https://navigatorkidsai.com'}/thank-you/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://navigatorkidsai.com'}/cart/`,
      // Collect email if not provided
      customer_email: customerEmail || undefined,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Metadata for your records
      metadata: {
        source: 'website_cart',
        items: JSON.stringify(items.map(i => i.id)),
      },
    };

    // If no email provided, collect it at checkout
    if (!customerEmail) {
      sessionParams.customer_creation = 'always';
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create checkout session' 
    });
  }
};
