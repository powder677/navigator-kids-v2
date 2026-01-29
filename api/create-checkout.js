// api/create-checkout.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🔒 PRODUCT MAP
// Maps frontend IDs to Stripe Price IDs from your CSV.
// STATUS: LIVE & VERIFIED (Jan 28, 2026)
const PRODUCT_MAP = {
  // === TIER 4: BUNDLES ($57 - $97) ===
  'prod_bundle_total': { 
     priceId: 'price_1Suhv9Ax6JDn4AuAVwA91AvY', // $97.00 - Total Access Pass
     name: 'Navigator Total Access Bundle' 
  },
  'prod_bundle_school': { 
     priceId: 'price_1SuhueAx6JDn4AuAfhofkzaX', // $79.00 - School Success Bundle
     name: 'School Success Bundle' 
  },
  'prod_bundle_peace': { 
     priceId: 'price_1SuhtzAx6JDn4AuA2TfH029k', // $57.00 - Peace at Home Bundle
     name: 'Peace at Home Bundle' 
  },

  // === TIER 3: CORE SYSTEMS ($37 - $67) ===
  'prod_system_iep': { 
     priceId: 'price_1St7A4Ax6JDn4AuAKnk66CbV', // $67.00 - IEP Advocacy System
     name: 'The IEP Advocacy System' 
  },
  'prod_system_social': { 
     priceId: 'price_1SuhsEAx6JDn4AuA3a1nMcc5', // $47.00 - Social Navigation System
     name: 'The Social Navigation System' 
  },
  'prod_system_meltdown': { 
     priceId: 'price_1SuhrLAx6JDn4AuAyRLk8vms', // $37.00 - Meltdown Navigation System
     name: 'The Meltdown Navigation System' 
  },

  // === TIER 2: QUICK WINS ($19 - $27) ===
  'prod_system_morning': { 
     priceId: 'price_1SuhqZAx6JDn4AuAfkkZGZVK', // $27.00 - Morning Launch System
     name: 'The Morning Launch System' 
  },
  'prod_workbook_anxiety': { 
     priceId: 'price_1St7AnAx6JDn4AuAXsfJWw2B', // $19.00 - Junior Agent Workbook
     name: 'Junior Agent Anxiety Workbook' 
  },

  // === TIER 1: ACTIVITY PACKETS ($9.00) ===
  'prod_packet_bravely': { 
    priceId: 'price_1St7BMAx6JDn4AuA1rqRIFyg', 
    name: 'Activity Pack: Bravely the Lion' 
  },
  'prod_packet_cosmo': { 
    priceId: 'price_1SuhkFAx6JDn4AuAMEP5PVXz', 
    name: 'Activity Pack: Cosmo' 
  },
  'prod_packet_ember': { 
    priceId: 'price_1SuhlFAx6JDn4AuAlUVVw44I', 
    name: 'Activity Pack: Ember' 
  },
  'prod_packet_shelly': { 
    priceId: 'price_1SuhmEAx6JDn4AuAwdQy0Y10', 
    name: 'Activity Pack: Shelly' 
  },
  'prod_packet_sketch': { 
    priceId: 'price_1Suhn5Ax6JDn4AuAYk7igvIL', 
    name: 'Activity Pack: Sketch' 
  },
  'prod_packet_whisper': { 
    priceId: 'price_1SuhnqAx6JDn4AuACe9s9Qya', 
    name: 'Activity Pack: Whisper' 
  }
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
