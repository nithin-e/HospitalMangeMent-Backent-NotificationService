import Stripe from 'stripe';
import { NotificationModel } from '../../entities/notification_Schema';
import https from 'https';
import { IstoreNotificationRepository } from '../interFace/storeNotificationRepoInterFace';

export default class StoreNotificationRepository implements IstoreNotificationRepository {
  private stripe: Stripe;
  
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    // Create a custom HTTPS agent with increased timeout
    const httpsAgent = new https.Agent({
      timeout: 60000, // 60 seconds timeout instead of default
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 5, // Limit concurrent connections
    });
    
    // Initialize Stripe with the custom agent and proper configuration
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-03-31.basil',
      httpAgent: httpsAgent,
      timeout: 60000, // 60 second timeout for API requests
      maxNetworkRetries: 3, // Automatically retry failed requests
    });
  }

  storingNotification_Datas = async (data: {
    email: string;
  }) => {
    try {
      // Custom values set in backend
      const message = "Your application has been approved! Please complete the payment to join our medical team.";
      const paymentAmount = 10000;

      // Generate a unique transaction ID
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      console.log(`Creating payment for ${data.email} with amount ${paymentAmount}`);
      
      // 1. Create a Stripe payment link
      const paymentLink = await this.createStripePaymentLink(
        data.email,
        paymentAmount,
        transactionId
      );
      
      console.log(`Successfully created payment link: ${paymentLink.url}`);
      
      // 2. Store notification with payment link
      const notification = await NotificationModel.create({
        email: data.email,
        message: message,
        type: 'PAYMENT',
        paymentAmount: paymentAmount,
        paymentLink: paymentLink.url,
        paymentStatus: 'PENDING',
        transactionId: transactionId, // Save the transaction ID for reference
        isRead: false,
        createdAt: new Date()
      });
      
      return { notification };
    } catch (error) {
      console.error("Error in storing notification data:", error);
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}`);
        if ('code' in error) console.error(`Error code: ${(error as any).code}`);
      }
      throw error;
    }
  };

  private createStripePaymentLink = async (email: string, amount: number, transactionId: string) => {
    try {
      console.log('Payment link creation initiated for email:', email);
      
      if (!process.env.FRONTEND_URL) {
        throw new Error('FRONTEND_URL is not defined in environment variables');
      }

      // Retry mechanism with exponential backoff
      const createWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
        try {
          return await fn();
        } catch (error) {
          if (retries <= 0) throw error;
          
          console.log(`Retrying operation after ${delay}ms, ${retries} attempts left`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return createWithRetry(fn, retries - 1, delay * 2);
        }
      };
      
      // Create a unique product name with transaction ID
      const productName = `Doctor Registration Fee - ${transactionId}`;
      
      // Create a product for this specific payment with retry
      const product = await createWithRetry(() => 
        this.stripe.products.create({
          name: productName,
          description: 'One-time fee to join our medical team',
          metadata: {
            email,
            transactionId,
            created: new Date().toISOString()
          }
        })
      );

      // Create a price for the product with retry
      const price = await createWithRetry(() => 
        this.stripe.prices.create({
          unit_amount: amount, // Already in cents
          currency: 'usd',
          product: product.id,
          metadata: {
            transactionId
          }
        })
      );

      // Create payment link with TypeScript cast to include prefilled_email
      const paymentLinkParams: any = {
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.FRONTEND_URL}/payment-success?email=${encodeURIComponent(email)}&transaction=${transactionId}`,
          },
        },
        metadata: {
          email,
          purpose: 'doctor_registration',
          createdAt: new Date().toISOString(),
          transactionId,
          uniqueId: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
        },
        automatic_tax: {
          enabled: false
        }
      };
      
      // Alternative approach: Only use prefilled_email in development environments
      if (process.env.NODE_ENV === 'development' && email) {
        // Consider using a randomly modified email for testing to prevent caching
        const testEmail = email.replace('@', `+${Math.floor(Math.random() * 10000)}@`);
        paymentLinkParams.prefilled_email = testEmail;
      }
      
      // Create payment link with retry
      const paymentLink = await createWithRetry(() => 
        this.stripe.paymentLinks.create(paymentLinkParams)
      );
      
      console.log(`Created payment link: ${paymentLink.url} for transaction: ${transactionId}`);
      
      return paymentLink;
    } catch (error) {
      console.error("Error creating Stripe payment link:", error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.name}: ${error.message}`);
        if ('statusCode' in error) console.error(`Status code: ${(error as any).statusCode}`);
      }
      throw error;
    }
  };

  async updatePaymentStatus(email: string, status: string, transactionId?: string): Promise<boolean> {
    try {
      const query: any = { email, paymentStatus: 'PENDING' };
      if (transactionId) {
        query.transactionId = transactionId;
      }
      
      const result = await NotificationModel.updateOne(
        query,
        { 
          $set: { 
            paymentStatus: status,
            paymentCompletedAt: new Date()
          } 
        }
      );
      const resultt = await NotificationModel.deleteMany({ email });
      console.log('Payment status update result:', result);
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}