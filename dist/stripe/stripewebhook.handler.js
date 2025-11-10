"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
// stripeWebhookHandler.ts
const stripe_1 = __importDefault(require("stripe"));
const notification_schema_1 = require("../entities/notification.schema");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil',
});
// Express handler for Stripe webhooks
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        return res.status(400).send('Missing stripe-signature header');
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(500).send('Webhook secret is not configured');
    }
    let event;
    try {
        // For Express, you need the raw body, ensure your middleware preserves it
        const payload = req.body;
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const email = session.metadata?.email;
                if (email) {
                    console.log(`Processing payment success for: ${email}`);
                    // Update notification payment status
                    await notification_schema_1.NotificationModel.updateMany({
                        email,
                        paymentStatus: 'PENDING',
                    }, {
                        paymentStatus: 'COMPLETED',
                        updatedAt: new Date(),
                    });
                    // Create a confirmation notification
                    await notification_schema_1.NotificationModel.create({
                        email,
                        message: 'Congratulations! Your payment was successful and you are now an active member of our team.',
                        type: 'INFO',
                        isRead: false,
                        createdAt: new Date(),
                    });
                }
                else {
                    console.error('No email found in session metadata');
                }
                break;
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const paymentEmail = paymentIntent.metadata?.email;
                if (paymentEmail) {
                    console.log(`Processing payment intent success for: ${paymentEmail}`);
                    // Update notification payment status
                    await notification_schema_1.NotificationModel.updateMany({
                        email: paymentEmail,
                        paymentStatus: 'PENDING',
                    }, {
                        paymentStatus: 'COMPLETED',
                        updatedAt: new Date(),
                    });
                    // Create a confirmation notification
                    await notification_schema_1.NotificationModel.create({
                        email: paymentEmail,
                        message: 'Congratulations! Your payment was successful and you are now an active member of our team.',
                        type: 'INFO',
                        isRead: false,
                        createdAt: new Date(),
                    });
                }
                else {
                    console.error('No email found in payment intent metadata');
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        // Return a 200 response to acknowledge receipt of the event
        res.status(200).json({ received: true });
    }
    catch (err) {
        console.error('Error processing webhook:', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
