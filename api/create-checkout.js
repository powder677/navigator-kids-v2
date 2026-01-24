// api/create-checkout.js
// Vercel Serverless Function for Stripe Checkout

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe Price IDs (from your Stripe Dashboard)
const STRIPE_PRICES = {
  'activity-packet': 'price_1St7BMAx6JDn4AuA1rqRIFyg',
  'ai-prompts': 'price_1St7AnAx6JDn4AuAXsfJWw2B',
  'complete-bundle': 'price_1St7A4Ax6JDn4AuAKnk66CbV',
  'toolkit-homework': 'price_1St79XAx6JDn4AuAp9ltEfNs',
  'toolkit-iep': 'price_1St78uAx6JDn4AuAhOH27Fbs',
  'toolkit-emotional': 'price_1St78LAx6JDn4AuAqFqKmw3T',
};

// Map site product IDs to Stripe product categories
const PRODUCT_TO_STRIPE = {
  'activity-packet-ember': 'activity-packet',
  'activity-packet-shelly': 'activity-packet',
  'activity-packet-sketch': 'activity-packet',
  'activity-packet-whisper': 'activity-packet',
  'activity-packet-bravely': 'activity-packet',
  'activity-packet-cosmo': 'activity-packet',
  'activity-packet-captain-choosy': 'activity-packet',
  'ai-prompts-intense-feeler': 'ai-prompts',
  'ai-prompts-reluctant-starter': 'ai-prompts',
  'ai-prompts-deep-diver': 'ai-prompts',
  'ai-prompts-sensitive-observer': 'ai-prompts',
  'ai-prompts-bold-explorer': 'ai-prompts',
  'ai-prompts-big-picture-thinker': 'ai-prompts',
  'complete-prompt-library': 'complete-bundle',
  'complete-activity-bundle': 'complete-bundle',
  'complete-bundle': 'complete-bundle',
  'bundle-complete': 'complete-bundle',
  'toolkit-emotional': 'toolkit-emotional',
  'toolkit-iep': 'toolkit-iep',
  'toolkit-homework': 'toolkit-homework',
};

module.exports = async (req, res) => {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');
  
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
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Convert cart items to Stripe line items
    const lineItems = [];
    for (const item of items) {
      const stripeCategory = item.stripeProduct || PRODUCT_TO_STRIPE[item.id];
      
      if (!stripeCategory) {
        return res.status(400).json({ error: `Unknown product: ${item.id}` });
      }
      
      const priceId = STRIPE_PRICES[stripeCategory];
      
      if (!priceId) {
        return res.status(400).json({ error: `No price for: ${stripeCategory}` });
      }

      lineItems.push({
        price: priceId,
        quantity: item.quantity || 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${req.headers.origin || 'https://navigator-kids-v2.vercel.app'}/thank-you/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://navigator-kids-v2.vercel.app'}/cart/`,
    });

    return res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ 
      error: error.message || 'Checkout failed' 
    });
  }
};
