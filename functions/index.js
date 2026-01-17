const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
const db = admin.firestore();

// Set SendGrid API key from GitHub secret
sgMail.setApiKey(process.env.SENDGRID_KEY);
const OWNER_EMAIL = process.env.OWNER_EMAIL;

// Cloud Function: Trigger when a new order is added
exports.sendOrderEmail = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    // Build email content
    const itemsList = order.items
      .map(i => `${i.title} x ${i.qty} - $${i.price.toFixed(2)}`)
      .join("\n");

    const msg = {
      to: OWNER_EMAIL,
      from: OWNER_EMAIL, // must be verified in SendGrid
      subject: `New Order Received: ${orderId}`,
      text: `
You have received a new order!

Order ID: ${orderId}
Customer: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}
Address: ${order.customer.address}

Items:
${itemsList}

Total: $${order.total.toFixed(2)}

Thank you!
      `
    };

    try {
      await sgMail.send(msg);
      console.log("Order email sent for order", orderId);
    } catch (err) {
      console.error("Error sending order email:", err);
    }
  });

// Optional: Test HTTP function
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from StyleWave Cloud Functions!");
});
