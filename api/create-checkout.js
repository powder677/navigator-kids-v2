// api/create-checkout.js
// Vercel Serverless Function for Stripe Checkout

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe Price IDs (from your Stripe Dashboard)
const STRIPE_PRICES = {
  'activity-packet': 'price_1St7BMAx6JDn4AuA1rqRIFyg',      // $9
  'ai-prompts': 'price_1St7AnAx6JDn4AuAXsfJWw2B',          // $19
  'complete-bundle': 'price_1St7A4Ax6JDn4AuAKnk66CbV',     // $67
  'toolkit-homework': 'price_1St79XAx6JDn4AuAp9ltEfNs',    // $29
  'toolkit-iep': 'price_1St78uAx6JDn4AuAhOH27Fbs',         // $29
  'toolkit-emotional': 'price_1St78LAx6JDn4AuAqFqKmw3T',   // $29
};

// Map site product IDs to Stripe product categories
const PRODUCT_TO_STRIPE = {
  // Activity Packets - all map to $9 activity packet
  'activity-packet-ember': 'activity-packet',
  'activity-packet-shelly': 'activity-packet',
  'activity-packet-sketch': 'activity-packet',
  'activity-packet-whisper': 'activity-packet',
  'activity-packet-bravely': 'activity-packet',
  'activity-packet-cosmo': 'activity-packet',
  'activity-packet-captain-choosy': 'activity-packet',
  
  // AI Prompt Packs - all map to $19 prompts
  'ai-prompts-intense-feeler': 'ai-prompts',
  'ai-prompts-reluctant-starter': 'ai-prompts',
  'ai-prompts-deep-diver': 'ai-prompts',
  'ai-prompts-sensitive-observer': 'ai-prompts',
  'ai-prompts-bold-explorer': 'ai-prompts',
  'ai-prompts-big-picture-thinker': 'ai-prompts',
  
  // Bundles
  'complete-prompt-library': 'complete-bundle',
  'complete-activity-bundle': 'complete-bundle',
  'complete-bundle': 'complete-bundle',
  'bundle-complete': 'complete-bundle',
  
  // Toolkits
  'toolkit-emotional': 'toolkit-emotional',
  'toolkit-iep': 'toolkit-iep',
  'toolkit-homework': 'toolkit-homework',
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
      // Get the Stripe product category
      const stripeCategory = item.stripeProduct || PRODUCT_TO_STRIPE[item.id];
      
      if (!stripeCategory) {
        throw new Error(`Unknown product: ${item.id}`);
      }
      
      const priceId = STRIPE_PRICES[stripeCategory];
      
      if (!priceId) {
        throw new Error(`No Stripe price configured for: ${stripeCategory}`);
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
