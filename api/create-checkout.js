// api/create-checkout.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🔒 SECURITY: Server-Side Price Authority
// The client sends an ID; we decide the price.
// Updated to User Pricing: $69 Combo, $29 Prompts, $12 Packets
const PRODUCT_MAP = {
  // HERO OFFER: Complete Support Plan (2 AI Prompts + 1 Packet)
  'prod_combo_complete': {
    priceId: 'price_combo_6900', // You must create this in Stripe ($69.00)
    name: 'Complete Support Plan (Navigator Bundle)',
    allowQuantity: false // One per customer usually
  },
  
  // SUPPORT SYSTEMS (AI Prompts) - $29
  'prod_prompt_anxiety': { priceId: 'price_prompt_anxiety_2900', name: 'Anxiety Support System' },
  'prod_prompt_executive': { priceId: 'price_prompt_exec_2900', name: 'Executive Function Support System' },
  'prod_prompt_social': { priceId: 'price_prompt_social_2900', name: 'Social Skills Support System' },

  // SUCCESS SYSTEMS (Activity Packets) - $12
  'prod_packet_bravely': { priceId: 'price_packet_bravely_1200', name: 'Bravely the Lion Success System' },
  'prod_packet_cosmo': { priceId: 'price_packet_cosmo_1200', name: 'Cosmo Space Pup Success System' },
  'prod_packet_whisper': { priceId: 'price_packet_whisper_1200', name: 'Whisper the Bunny Success System' },

  // ORDER BUMPS / ADD-ONS
  'prod_audio_meltdown': { priceId: 'price_audio_meltdown_900', name: 'Emergency Meltdown Audio' }, // $9
  'prod_guide_iep': { priceId: 'price_guide_iep_1200', name: 'IEP Translator Packet' }, // $12
  'prod_service_concierge': { priceId: 'price_service_concierge_19900', name: 'Concierge Prompt Setup' } // $199
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, successUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 🛡️ SECURITY: Validate and Construct Line Items
    const lineItems = items.map(item => {
      const product = PRODUCT_MAP[item.id];
      
      // Stop invalid product injection
      if (!product) {
        throw new Error(`Invalid product ID: ${item.id}`);
      }

      // Stop negative quantity exploits
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity < 1) {
        throw new Error('Invalid quantity');
      }

      return {
        price: product.priceId,
        quantity: quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || 'https://navigatorkids.ai/thank-you',
      cancel_url: cancelUrl || 'https://navigatorkids.ai/cart',
      allow_promotion_codes: true, // Enable coupons
      metadata: {
        source: 'navigator_v2_checkout',
        product_ids: items.map(i => i.id).join(',')
      },
      // OPTIONAL: Enable this if you configure the Order Bump in Stripe Dashboard
      // phone_number_collection: { enabled: true }, 
    });

    res.status(200).json({ id: session.id });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
};
