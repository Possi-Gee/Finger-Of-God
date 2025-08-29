
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Configure Nodemailer with your Gmail credentials
// IMPORTANT: Use environment variables to store your email and password securely.
// In the Firebase console, set these using:
// firebase functions:config:set gmail.email="your-email@gmail.com"
// firebase functions:config:set gmail.password="your-16-character-app-password"
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

/**
 * Sends an email notification when an order's status changes.
 */
exports.onOrderStatusChange = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // Check if the status field has actually changed
    if (newValue.status === previousValue.status) {
      console.log(`Status for order ${context.params.orderId} is unchanged. No email sent.`);
      return null;
    }

    const customerEmail = newValue.customerEmail;
    const orderId = newValue.orderId;
    const status = newValue.status;

    if (!customerEmail) {
      console.error(`Missing customerEmail for order ${orderId}. Cannot send email.`);
      return null;
    }

    const mailOptions = {
      from: `"Your Shop Name" <${gmailEmail}>`,
      to: customerEmail,
      subject: `Order ${orderId} Update`,
      text: `Hi, your order status is now: ${status}`,
      html: `<p>Hi,</p><p>Your order status is now: <strong>${status}</strong></p>`,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      console.log(`Successfully sent email for order ${orderId} to ${customerEmail}`);
      return null;
    } catch (error) {
      console.error(
        "There was an error while sending the email for order",
        orderId,
        ":",
        error,
      );
      return null;
    }
  });

