// api/create-checkout.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCT_MAP = {
  // === RESTORED MISSING PRODUCTS (From HTML) ===
  'prod_combo_complete': { 
     // Using the Total Bundle Price ID as fallback since it's similar value/content
     // Ideally you should create a specific Stripe Price for this $69 offer
     priceId: 'price_1Suhv9Ax6JDn4AuAVwA91AvY', // Currently maps to Total Bundle ($97). 
     // TODO: REPLACE WITH $69 STRIPE PRICE ID
     name: 'Complete Support Plan' 
  },
  'prod_prompt_executive': { 
     // Using Morning Launch System as fallback
     priceId: 'price_1SuhqZAx6JDn4AuAfkkZGZVK', // $27.00
     name: 'Executive Function AI System' 
  },

  // === STANDARD CATALOG ===
  'prod-bundle-total': { priceId: 'price_1Suhv9Ax6JDn4AuAVwA91AvY', name: 'Navigator Total Access Bundle' },
  'prod-bundle-school': { priceId: 'price_1SuhueAx6JDn4AuAfhofkzaX', name: 'School Success Bundle' },
  'prod-bundle-peace': { priceId: 'price_1SuhtzAx6JDn4AuA2TfH029k', name: 'Peace at Home Bundle' },
  'prod-system-iep': { priceId: 'price_1St7A4Ax6JDn4AuAKnk66CbV', name: 'The IEP Advocacy System' },
  'prod-system-social': { priceId: 'price_1SuhsEAx6JDn4AuA3a1nMcc5', name: 'The Social Navigation System' },
  'prod-system-meltdown': { priceId: 'price_1SuhrLAx6JDn4AuAyRLk8vms', name: 'The Meltdown Navigation System' },
  'prod-system-morning': { priceId: 'price_1SuhqZAx6JDn4AuAfkkZGZVK', name: 'The Morning Launch System' },
  'prod-workbook-anxiety': { priceId: 'price_1St7AnAx6JDn4AuAXsfJWw2B', name: 'Junior Agent Anxiety Workbook' },
  'prod-packet-bravely': { priceId: 'price_1St7BMAx6JDn4AuA1rqRIFyg', name: 'Activity Pack: Bravely' },
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
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: { source: 'navigator_v2_launch', product_ids: items.map(i => i.id).join(',') }
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
};
