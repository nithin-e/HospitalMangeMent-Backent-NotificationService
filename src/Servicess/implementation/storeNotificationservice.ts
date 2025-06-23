import { IstoreNotificationService } from "../interFace/storeNotificationServiceInterFace";
import StoreNotificationRepository from "../../repositories/implementation/storeNotificationRepo";




export interface WebhookEventData {
  type: string;
  data: {
    object: {
      metadata?: {
        email?: string;
      };
      [key: string]: any;
    };
  };
}


export default class StoreNotificationService implements IstoreNotificationService {
  private StoreNotificationRepo: StoreNotificationRepository;
  
  constructor(StoreNotificationRepo: StoreNotificationRepository) {
    this.StoreNotificationRepo = StoreNotificationRepo;
  }

  StoreNotification_Data = async (data: {
    email: string; 
  }) => {
    try {
      const response = await this.StoreNotificationRepo.storingNotification_Datas(data);
      console.log('usecase responce',response);
      
      return response;
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  }


  async processWebhookEvent(eventType: string, eventData: WebhookEventData): Promise<{success: boolean; message: string}> {
    try {
      if (eventType === 'checkout.session.completed') {
        const email = eventData.data.object.metadata?.email;
        
        if (!email) {
          console.error('Email not found in session metadata');
          return { 
            success: false, 
            message: 'Email not found in session metadata' 
          };
        }
        
        console.log(`Processing payment completion for email in usecase: ${email}`);
        
        // Update notification payment status
        const updated = await this.StoreNotificationRepo.updatePaymentStatus(email, 'COMPLETED');
        
        if (updated) {
          return { 
            success: true, 
            message: 'Payment status updated successfully' 
          };
        } else {
          return { 
            success: false, 
            message: 'No pending payment found for this email' 
          };
        }
      }
      
      return { 
        success: true, 
        message: 'Event acknowledged but no action taken' 
      };
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return { 
        success: false, 
        message: `Error processing webhook: ` 
      };
    }
  }

  rescheduleAppointment__Notification = async (data: { email: string, time: string }) => {
    try {
      const response = await this.StoreNotificationRepo.reschedule_Appointment__Notification(data);
      console.log('usecase response:', response);
      
      return response;
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  }
}
