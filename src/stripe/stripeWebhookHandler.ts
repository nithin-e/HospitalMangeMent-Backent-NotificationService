// stripeWebhookHandler.ts
import Stripe from 'stripe';
import express from 'express';
import { NotificationModel } from '../entities/notification_Schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-03-31.basil',
});

// Express handler for Stripe webhooks
export const handleStripeWebhook = async (req: express.Request, res: express.Response) => {
  const sig = req.headers['stripe-signature'] as string;
  
  if (!sig) {
    return res.status(400).send('Missing stripe-signature header');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Webhook secret is not configured');
  }

  let event: Stripe.Event;
  
  try {
    // For Express, you need the raw body, ensure your middleware preserves it
    const payload = req.body;
    
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.metadata?.email;
        
        if (email) {
          console.log(`Processing payment success for: ${email}`);
          
          // Update notification payment status
          await NotificationModel.updateMany(
            { 
              email,
              paymentStatus: 'PENDING' 
            },
            { 
              paymentStatus: 'COMPLETED',
              updatedAt: new Date()
            }
          );
          
          // Create a confirmation notification
          await NotificationModel.create({
            email,
            message: 'Congratulations! Your payment was successful and you are now an active member of our team.',
            type: 'INFO',
            isRead: false,
            createdAt: new Date()
          });
        } else {
          console.error('No email found in session metadata');
        }
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentEmail = paymentIntent.metadata?.email;
        
        if (paymentEmail) {
          console.log(`Processing payment intent success for: ${paymentEmail}`);
          
          // Update notification payment status
          await NotificationModel.updateMany(
            { 
              email: paymentEmail,
              paymentStatus: 'PENDING' 
            },
            { 
              paymentStatus: 'COMPLETED',
              updatedAt: new Date()
            }
          );
          
          // Create a confirmation notification
          await NotificationModel.create({
            email: paymentEmail,
            message: 'Congratulations! Your payment was successful and you are now an active member of our team.',
            type: 'INFO',
            isRead: false,
            createdAt: new Date()
          });
        } else {
          console.error('No email found in payment intent metadata');
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }
};
// NOTE: You must configure Express to preserve the raw body for Stripe webhook verification:
// Add this middleware before your routes:
/*
app.use(
  express.json({
    verify: (req, res, buf) => {
      // Store raw body for Stripe webhook verification
      if (req.originalUrl.startsWith('/webhook')) {
        (req as any).rawBody = buf;
      }
    }
  })
);
*/