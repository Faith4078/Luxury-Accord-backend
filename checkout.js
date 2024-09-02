const express = require('express');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const app = express();
app.use(express.static('public'));
app.use(express.json());

const YOUR_DOMAIN = 'https://luxury-accord.vercel.app';

app.use(
  cors({
    origin: YOUR_DOMAIN,
  })
);

app.post('/create-checkout-session', async (req, res) => {
  const { cart } = req.body;

  const line_items = cart.map((cartItem) => {
    const { id, image, normalPrice, amount, name } = cartItem;
    return {
      quantity: amount,
      price_data: {
        currency: 'usd',
        product_data: {
          name: name,
          images: [image],
        },
        unit_amount: normalPrice * 100, // price in cents
      },
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success?success=true`,
      cancel_url: `${YOUR_DOMAIN}/cancel?canceled=true`,
    });

    // Send session URL to the client
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log('Running on port 4242'));
