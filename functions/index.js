
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure Nodemailer transporter using environment variables
// IMPORTANT: You must use an "App Password" for this to work with Gmail's security.
// See: https://support.google.com/accounts/answer/185833
//
// To set these variables, run the following commands in your terminal in the project directory:
// firebase functions:config:set gmail.user="your-email@gmail.com"
// firebase functions:config:set gmail.pass="your-16-digit-app-password"
//
// After setting, deploy functions for the changes to take effect:
// firebase deploy --only functions
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().gmail.user,
        pass: functions.config().gmail.pass,
    },
});

// The admin email should also be configured for flexibility.
// Run: firebase functions:config:set admin.email="your-admin-email@example.com"
const ADMIN_EMAIL = functions.config().admin.email;

/**
 * Generates the HTML body for an email.
 * @param {string} title The title of the email.
 * @param {string} body The main content of the email.
 * @param {object} order The order object.
 * @param {string} appName The name of the application.
 * @return {string} The HTML content of the email.
 */
function generateEmailHTML(title, body, order, appName) {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 15px 0;">
                <img src="${item.image}" alt="${item.name}" width="64" style="border-radius: 8px; object-fit: cover; aspect-ratio: 1/1; margin-right: 15px; vertical-align: middle;">
            </td>
            <td style="padding: 15px 0; vertical-align: top;">
                <p style="margin: 0; font-weight: 600; font-size: 14px; color: #333;">${item.name}</p>
                <p style="margin: 4px 0 0; color: #777; font-size: 12px;">${item.variant.name} &times; ${item.quantity}</p>
            </td>
            <td style="padding: 15px 0; text-align: right; font-weight: 600; font-size: 14px; color: #333;">
                GH₵${(item.variant.price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const shippingAddressHtml = order.shippingAddress ? `
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #333;">Shipping to</h3>
        <p style="margin: 0; color: #555; line-height: 1.6;">
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
            ${order.shippingAddress.country}
        </p>
    ` : '';
    
    // A base URL should be configured for production environments
    const orderUrl = `https://shopwave-6mh7a.web.app/orders/${order.id}`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 30px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea; }
            .header h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0; }
            .content { padding: 30px 0; }
            .content h2 { font-size: 22px; font-weight: 600; color: #1a1a1a; margin-top: 0; margin-bottom: 15px; }
            .content p { font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 15px; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { background-color: #1976d2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #888; }
            table { width: 100%; border-collapse: collapse; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${appName}</h1>
            </div>
            <div class="content">
                <h2>${title}</h2>
                <p>${body}</p>

                <div class="button-container">
                    <a href="${orderUrl}" class="button">View Your Order</a>
                </div>

                <h3 style="font-size: 18px; font-weight: 600; margin-top: 30px; margin-bottom: 15px; color: #333;">Order Summary (ID: #${order.id})</h3>
                <table>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <table style="width: 100%; margin-top: 20px;">
                    <tbody>
                        <tr>
                            <td style="padding: 5px 0; text-align: right; color: #555;">Subtotal:</td>
                            <td style="padding: 5px 0; width: 100px; text-align: right;">GH₵${order.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; text-align: right; color: #555;">Shipping:</td>
                            <td style="padding: 5px 0; text-align: right;">GH₵${order.shippingFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; text-align: right; color: #555;">Tax:</td>
                            <td style="padding: 5px 0; text-align: right;">GH₵${order.tax.toFixed(2)}</td>
                        </tr>
                        <tr style="border-top: 1px solid #eaeaea;">
                            <td style="padding: 10px 0 0; text-align: right; font-weight: 700; font-size: 18px;">Total:</td>
                            <td style="padding: 10px 0 0; text-align: right; font-weight: 700; font-size: 18px;">GH₵${order.total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="details-grid">
                    <div>
                        ${shippingAddressHtml}
                    </div>
                </div>

            </div>
             <div class="footer">
                <p>Thank you for your purchase! If you have any questions, please contact our support team.</p>
                <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Sends emails when a new order is created.
 * One to the customer confirming the order, and one to the admin.
 */
exports.onOrderCreate = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
        const order = snap.data();
        const customerEmail = order.shippingAddress.email;
        const appName = order.appName || "ShopWave"; // Fallback app name

        functions.logger.log(`New order #${order.id} received. Preparing emails...`);

        // --- Email to Customer ---
        const customerMailOptions = {
            from: `"${appName}" <${functions.config().gmail.user}>`,
            to: customerEmail,
            subject: `Your ${appName} Order Confirmation #${order.id}`,
            html: generateEmailHTML(
                "Thanks for your order!",
                `Hi ${order.shippingAddress.fullName}, we're getting your order ready. We'll notify you once it has shipped. You can view its current status at any time.`,
                order,
                appName
            ),
        };

        // --- Email to Admin ---
        const adminMailOptions = {
            from: `"${appName} Admin" <${functions.config().gmail.user}>`,
            to: ADMIN_EMAIL,
            subject: `New Order Received #${order.id}`,
            html: generateEmailHTML(
                "You've received a new order!",
                `A new order (#${order.id}) was placed by ${order.shippingAddress.fullName} (${customerEmail}). Please review it in the admin dashboard.`,
                order,
                appName
            ),
        };

        try {
            functions.logger.log("Sending confirmation email to customer:", customerEmail);
            const customerEmailInfo = await transporter.sendMail(customerMailOptions);
            functions.logger.log("Successfully sent confirmation email to customer:", customerEmailInfo.response);

            if (ADMIN_EMAIL) {
                functions.logger.log("Sending notification email to admin:", ADMIN_EMAIL);
                const adminEmailInfo = await transporter.sendMail(adminMailOptions);
                functions.logger.log("Successfully sent admin notification email:", adminEmailInfo.response);
            }
        } catch (error) {
            functions.logger.error("Error sending emails for order #" + order.id, {
                errorMessage: error.message,
                errorStack: error.stack,
                errorCode: error.code,
            });
        }
    });

/**
 * Sends an email to the customer when their order status is updated.
 */
exports.onOrderUpdate = functions.firestore
    .document("orders/{orderId}")
    .onUpdate(async (change, context) => {
        const order = change.after.data();
        const previousOrder = change.before.data();

        // Check if the status has actually changed
        if (order.status === previousOrder.status) {
            functions.logger.log(`Skipping email for order #${order.id}: status unchanged.`);
            return null;
        }

        functions.logger.log(`Order #${order.id} status changed from ${previousOrder.status} to ${order.status}. Preparing email...`);

        const customerEmail = order.shippingAddress.email;
        const appName = order.appName || "ShopWave";

        const getStatusInfo = (status) => {
            switch (status) {
                case "Shipped":
                    return {
                        title: "Your order has shipped!",
                        message: "Great news! Your order is on its way. You can track its progress from your order history page.",
                    };
                case "Delivered":
                    return {
                        title: "Your order has been delivered!",
                        message: "Your order has arrived. We hope you enjoy your items! Thank you for shopping with us.",
                    };
                case "Cancelled":
                    return {
                        title: "Your order has been cancelled.",
                        message: "Your order has been cancelled as requested. If you have any questions, please contact support.",
                    };
                default:
                    return null; // Don't send emails for 'Pending' or other statuses
            }
        };

        const statusInfo = getStatusInfo(order.status);
        if (!statusInfo) {
            functions.logger.log(`No email template for status "${order.status}". Email not sent for order #${order.id}.`);
            return null; // No email needed for this status change
        }

        const mailOptions = {
            from: `"${appName}" <${functions.config().gmail.user}>`,
            to: customerEmail,
            subject: `Your ${appName} order #${order.id} is now: ${order.status}`,
            html: generateEmailHTML(
                statusInfo.title,
                `Hi ${order.shippingAddress.fullName},<br>${statusInfo.message}`,
                order,
                appName
            ),
        };

        try {
            functions.logger.log(`Sending status update email to ${customerEmail} for order ${order.id}`);
            const emailInfo = await transporter.sendMail(mailOptions);
            functions.logger.log(`Successfully sent status update email for order #${order.id}:`, emailInfo.response);
        } catch (error) {
             functions.logger.error(`Error sending status update email for order #${order.id}`, {
                errorMessage: error.message,
                errorStack: error.stack,
                errorCode: error.code,
            });
        }
        return null;
    });

/**
 * Sends a push notification when a new product is added.
 */
exports.onProductCreate = functions.firestore
  .document('products/{productId}')
  .onCreate(async (snap, context) => {
    const product = snap.data();

    const topic = 'new_products'; 

    const payload = {
      notification: {
        title: '✨ New Product Added!',
        body: `Check out the new ${product.name}!`,
        icon: product.images[0] || '/favicon.ico', 
        click_action: `/product/${product.id}`
      }
    };
    
    console.log(`Sending notification for new product: ${product.name}`);

    try {
      await admin.messaging().sendToTopic(topic, payload);
      console.log('Successfully sent new product notification.');
      return null;
    } catch (error) {
      console.error('Error sending new product notification:', error);
      return null;
    }
  });

    