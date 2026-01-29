// api/create-checkout.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🔒 PRODUCT MAP
// STATUS: Updated to Hyphens for Consistency
const PRODUCT_MAP = {
  // === TIER 4: BUNDLES ===
  'prod-bundle-total': { 
     priceId: 'price_1Suhv9Ax6JDn4AuAVwA91AvY', // $97.00
     name: 'Navigator Total Access Bundle' 
  },
  'prod-bundle-school': { 
     priceId: 'price_1SuhueAx6JDn4AuAfhofkzaX', // $79.00
     name: 'School Success Bundle' 
  },
  'prod-bundle-peace': { 
     priceId: 'price_1SuhtzAx6JDn4AuA2TfH029k', // $57.00
     name: 'Peace at Home Bundle' 
  },

  // === TIER 3: CORE SYSTEMS ===
  'prod-system-iep': { 
     priceId: 'price_1St7A4Ax6JDn4AuAKnk66CbV', // $67.00
     name: 'The IEP Advocacy System' 
  },
  'prod-system-social': { 
     priceId: 'price_1SuhsEAx6JDn4AuA3a1nMcc5', // $47.00
     name: 'The Social Navigation System' 
  },
  'prod-system-meltdown': { 
     priceId: 'price_1SuhrLAx6JDn4AuAyRLk8vms', // $37.00
     name: 'The Meltdown Navigation System' 
  },

  // === TIER 2: QUICK WINS ===
  'prod-system-morning': { 
     priceId: 'price_1SuhqZAx6JDn4AuAfkkZGZVK', // $27.00
     name: 'The Morning Launch System' 
  },
  'prod-workbook-anxiety': { 
     priceId: 'price_1St7AnAx6JDn4AuAXsfJWw2B', // $19.00
     name: 'Junior Agent Anxiety Workbook' 
  },

  // === TIER 1: ACTIVITY PACKETS ($9.00) ===
  'prod-packet-bravely': { priceId: 'price_1St7BMAx6JDn4AuA1rqRIFyg', name: 'Activity Pack: Bravely the Lion' },
  'prod-packet-cosmo': { priceId: 'price_1SuhkFAx6JDn4AuAMEP5PVXz', name: 'Activity Pack: Cosmo' },
  'prod-packet-ember': { priceId: 'price_1SuhlFAx6JDn4AuAlUVVw44I', name: 'Activity Pack: Ember' },
  'prod-packet-shelly': { priceId: 'price_1SuhmEAx6JDn4AuAwdQy0Y10', name: 'Activity Pack: Shelly' },
  'prod-packet-sketch': { priceId: 'price_1Suhn5Ax6JDn4AuAYk7igvIL', name: 'Activity Pack: Sketch' },
  'prod-packet-whisper': { priceId: 'price_1SuhnqAx6JDn4AuACe9s9Qya', name: 'Activity Pack: Whisper' }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { items, successUrl, cancelUrl } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const lineItems = items.map(item => {
      const product = PRODUCT_MAP[item.id];
      if (!product) throw new Error(`Invalid product ID: ${item.id}`);
      return { price: product.priceId, quantity: parseInt(item.quantity) || 1 };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || 'https://navigatorkids.ai/thank-you',
      cancel_url: cancelUrl || 'https://navigatorkids.ai/cart',
      allow_promotion_codes: true,
      metadata: { source: 'navigator_v2_launch', product_ids: items.map(i => i.id).join(',') }
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
};
