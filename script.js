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
const express = require("express");
const stripe = require("stripe")("TA_CLE_STRIPE");
const fs = require("fs-extra");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DB = "db.json";

async function getDB() {
  try { return await fs.readJson(DB); }
  catch { return []; }
}

async function saveDB(data) {
  await fs.writeJson(DB, data);
}

// vérifier dispo par moto
function isAvailable(reservations, moto, start, end) {
  return !reservations.some(r =>
    r.moto === moto &&
    (new Date(start) <= new Date(r.end) &&
     new Date(end) >= new Date(r.start))
  );
}

app.post("/checkout", async (req, res) => {
  const { moto, start, end, email } = req.body;
  let db = await getDB();

  if (!isAvailable(db, moto, start, end)) {
    return res.json({ error: "Déjà réservé" });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: { name: moto },
        unit_amount: 5000
      },
      quantity: 1
    }],
    mode: "payment",
    success_url: "http://localhost:3000/success.html",
    cancel_url: "http://localhost:3000"
  });

  db.push({ moto, start, end, email });
  await saveDB(db);

  res.json({ id: session.id });
});

app.get("/reservations", async (req, res) => {
  res.json(await getDB());
});

app.listen(3000, () => console.log("🚀 Startup server ready"));
