// api/create-checkout.js
// Vercel Serverless Function for Stripe Checkout

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map your product IDs to Stripe Price IDs
// UPDATE THESE with your actual Stripe Price IDs from the dashboard
const PRICE_MAP = {
  // Toolkits - $29 each
  'toolkit-emotional': 'price_REPLACE_WITH_EMOTIONAL_TOOLKIT_PRICE_ID',
  'toolkit-iep': 'price_REPLACE_WITH_IEP_TOOLKIT_PRICE_ID',
  'toolkit-homework': 'price_REPLACE_WITH_HOMEWORK_TOOLKIT_PRICE_ID',
  
  // Complete Bundle - $67
  'bundle-complete': 'price_REPLACE_WITH_COMPLETE_BUNDLE_PRICE_ID',
  
  // AI Prompt Packs - $19 each
  'prompts-meltdown': 'price_REPLACE_WITH_MELTDOWN_PROMPTS_PRICE_ID',
  'prompts-homework': 'price_REPLACE_WITH_HOMEWORK_PROMPTS_PRICE_ID',
  'prompts-iep': 'price_REPLACE_WITH_IEP_PROMPTS_PRICE_ID',
  'prompts-social': 'price_REPLACE_WITH_SOCIAL_PROMPTS_PRICE_ID',
  'prompts-morning': 'price_REPLACE_WITH_MORNING_PROMPTS_PRICE_ID',
  'prompts-anxiety': 'price_REPLACE_WITH_ANXIETY_PROMPTS_PRICE_ID',
  
  // Activity Packets - $9 each
  'activity-intense-feeler': 'price_REPLACE_WITH_INTENSE_FEELER_ACTIVITY_PRICE_ID',
  'activity-reluctant-starter': 'price_REPLACE_WITH_RELUCTANT_STARTER_ACTIVITY_PRICE_ID',
  'activity-deep-diver': 'price_REPLACE_WITH_DEEP_DIVER_ACTIVITY_PRICE_ID',
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
