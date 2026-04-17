const express = require("express");
const app = express();

const stripe = require("stripe")("sk_test_51TNAokRzGdWGudJ520ZAIJET4VZLgE
1ХССEСRNmyBHtkvVМrYzIKЗwqТJqjbN666bWwaE
bjFkJLlknmsKn8BMOfe00AdSb6rL2");

app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: {
          name: "Réservation moto",
        },
        unit_amount: 5000, // 50€
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: "https://ton-site.com/success.html",
    cancel_url: "https://ton-site.com/cancel.html",
  });

  res.json({ id: session.id });
});

app.listen(3000, () => console.log("Server running"));
