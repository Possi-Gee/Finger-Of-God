
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK
admin.initializeApp();

// --- WARNING: Do NOT use hardcoded credentials in a real application ---
// Replace the placeholder values below with your actual Gmail address and 16-character App Password.
// This is NOT secure. It is strongly recommended to use Firebase environment configuration instead.
const gmailEmail = "temahfingerofgod@gmail.com";
const gmailPassword = "hngmxhtdvreycent";
// --- End of Warning ---


const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

/**
 * Sends email notifications when a new order is created to both customer and admin.
 */
exports.onOrderCreate = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;
    const customerEmail = order.customerEmail;
    
    if (!customerEmail) {
      console.error(`Missing customerEmail for new order ${orderId}. Cannot send email.`);
      return null;
    }

    // Email to the customer
    const customerMailOptions = {
      from: `"Your Shop Name" <${gmailEmail}>`,
      to: customerEmail,
      subject: `Your Order Confirmation #${orderId}`,
      text: `Hi, thank you for your order! We've received order #${orderId} and are getting it ready.`,
      html: `<p>Hi,</p><p>Thank you for your order! We've received order <strong>#${orderId}</strong> and are getting it ready for you.</p>`,
    };
    
    // Email to the admin/app owner
    const adminMailOptions = {
        from: `"ShopWave Admin" <${gmailEmail}>`,
        to: gmailEmail, // Send to the app owner's email
        subject: `[New Order] You have a new order: #${orderId}`,
        text: `A new order with ID #${orderId} has been placed by ${customerEmail}. Please check the admin dashboard to process it.`,
        html: `<p>A new order with ID <strong>#${orderId}</strong> has been placed by ${customerEmail}.</p><p>Please check the admin dashboard to process it.</p>`,
    };

    try {
      // Send both emails concurrently
      await Promise.all([
        mailTransport.sendMail(customerMailOptions),
        mailTransport.sendMail(adminMailOptions)
      ]);
      console.log(`Successfully sent confirmation emails for order ${orderId} to customer (${customerEmail}) and admin.`);
      return null;
    } catch (error) {
      console.error(
        "There was an error while sending the confirmation emails for order",
        orderId,
        ":",
        error,
      );
      return null;
    }
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
    const orderId = context.params.orderId;
    const status = newValue.status;

    if (!customerEmail) {
      console.error(`Missing customerEmail for order ${orderId}. Cannot send email.`);
      return null;
    }

    const mailOptions = {
      from: `"Your Shop Name" <${gmailEmail}>`,
      to: customerEmail,
      subject: `Order #${orderId} Update`,
      text: `Hi, your order status is now: ${status}`,
      html: `<p>Hi,</p><p>Your order status is now: <strong>${status}</strong></p>`,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      console.log(`Successfully sent status update email for order ${orderId} to ${customerEmail}`);
      return null;
    } catch (error) {
      console.error(
        "There was an error while sending the status update email for order",
        orderId,
        ":",
        error,
      );
      return null;
    }
  });
