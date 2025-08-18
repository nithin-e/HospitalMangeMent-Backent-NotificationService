import Stripe from 'stripe';
import { NotificationModel } from '../../entities/notification_Schema';
import https from 'https';
import { IStoreNotificationRepository } from '../interFace/storeNotificationRepoInterFace';


export interface NotificationData {
  email: string;
}

export interface RescheduleData {
  email: string;
  time: string;
}

export interface AdminBlockData {
  email: string;
  reason: string;
}

export interface NotificationResponse {
  notification: any; 
}

export interface RescheduleResponse {
  success: boolean;
  notification?: any;
  message?: string;
}

export interface AdminBlockResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface PaymentStatusUpdateResponse {
  success: boolean;
}

export default class StoreNotificationRepository implements IStoreNotificationRepository {
  private stripe: Stripe;
  
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    const httpsAgent = new https.Agent({
      timeout: 60000,
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 5, 
    });
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-03-31.basil',
      httpAgent: httpsAgent,
      timeout: 60000,
      maxNetworkRetries: 3, 
    });
  }

  storeNotificationData = async (data: NotificationData): Promise<NotificationResponse> => {
    try {
      const message = "Your application has been approved! Please complete the payment to join our medical team.";
      const paymentAmount = 10000;
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      const paymentLink = await this.createStripePaymentLink(
        data.email,
        paymentAmount,
        transactionId
      );
      
      const notification = await NotificationModel.create({
        email: data.email,
        message: message,
        type: 'PAYMENT',
        paymentAmount: paymentAmount,
        paymentLink: paymentLink.url,
        paymentStatus: 'PENDING',
        transactionId: transactionId, 
        isRead: false,
        createdAt: new Date()
      });
      
      return { notification };
    } catch (error) {
      console.error("Error in storing notification data:", error);
      throw error;
    }
  };

  private createStripePaymentLink = async (email: string, amount: number, transactionId: string): Promise<Stripe.PaymentLink> => {
    try {
      if (!process.env.FRONTEND_URL) {
        throw new Error('FRONTEND_URL is not defined in environment variables');
      }

      const createWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
        try {
          return await fn();
        } catch (error) {
          if (retries <= 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          return createWithRetry(fn, retries - 1, delay * 2);
        }
      };
      
      const productName = `Doctor Registration Fee - ${transactionId}`;
      
      const product = await createWithRetry(() => 
        this.stripe.products.create({
          name: productName,
          description: 'One-time fee to join our medical team',
          metadata: { email, transactionId, created: new Date().toISOString() }
        })
      );

      const price = await createWithRetry(() => 
        this.stripe.prices.create({
          unit_amount: amount,
          currency: 'usd',
          product: product.id,
          metadata: { transactionId }
        })
      );

      const paymentLinkParams: any = {
        line_items: [{ price: price.id, quantity: 1 }],
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
        automatic_tax: { enabled: false }
      };
      
      if (process.env.NODE_ENV === 'development' && email) {
        const testEmail = email.replace('@', `+${Math.floor(Math.random() * 10000)}@`);
        paymentLinkParams.prefilled_email = testEmail;
      }
      
      const paymentLink = await createWithRetry(() => 
        this.stripe.paymentLinks.create(paymentLinkParams)
      );
      
      return paymentLink;
    } catch (error) {
      console.error("Error creating Stripe payment link:", error);
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
      await NotificationModel.deleteMany({ email });
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  rescheduleAppointmentNotification = async (data: RescheduleData): Promise<RescheduleResponse> => {
    try {
      const notificationMessage = `Your appointment has been rescheduled to ${data.time}. Sorry for the inconvenience.`;
      
      const newNotification = new NotificationModel({
        email: data.email,
        message: notificationMessage,
        type: 'INFO',
        isRead: false,
        createdAt: new Date(),
        paymentStatus: 'PENDING'
      });
  
      const savedNotification = await newNotification.save();
  
      return {
        success: true,
        notification: savedNotification,
        message: 'Reschedule notification created successfully'
      };
    } catch (error) {
      console.error("Error in storing notification data:", error);
      throw error;
    }
  }

  createAdminBlockNotification = async (data: AdminBlockData): Promise<AdminBlockResponse> => {
    try {
      const newNotification = new NotificationModel({
        email: data.email,
        message: data.reason,
        type: 'ALERT', 
        isRead: false,
        paymentStatus: 'PENDING',
        createdAt: new Date(),
      });
  
      await newNotification.save();
      
      return {
        success: true
      };
    } catch (error) {
      console.error("Error in storing notification data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to create notification'
      };
    }
  }
}