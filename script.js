const express = require("express");
const stripe = require("stripe")("TA_CLE_SECRETE_STRIPE");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let reservations = [];

// Vérifier disponibilité
function isAvailable(start, end) {
    return !reservations.some(r =>
        (start <= r.end && end >= r.start)
    );
}

// Réservation + paiement
app.post("/create-checkout-session", async (req, res) => {
    const { start, end } = req.body;

    if (!isAvailable(start, end)) {
        return res.status(400).json({ error: "Dates déjà réservées" });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "eur",
                product_data: {
                    name: "Acompte location TMAX 560",
                },
                unit_amount: 5000, // 50€
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: "http://localhost:3000/success.html",
        cancel_url: "http://localhost:3000",
    });

    reservations.push({ start, end });

    res.json({ id: session.id });
});

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));
