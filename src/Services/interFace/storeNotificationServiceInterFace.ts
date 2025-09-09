// Request types
interface NotificationRequest {
    email: string;
  }
  
  
  // Response types
  interface NotificationServiceResponse {
    notification: any; // Replace with your actual notification type
  }
  

  
 
  
   interface RescheduleRepositoryResponse {
    success: boolean;
    notification?: any;
    message?: string;
  }
  
  interface AdminBlockRepositoryResponse {
    success: boolean;
    error?: string;
    message?: string;
  }

  
  export interface WebhookResponse {
    success: boolean;
    message: string;
  }
  


  export interface IStoreNotificationService {
  storeNotificationData(data: NotificationRequest): Promise<NotificationServiceResponse>;
  processWebhookEvent(email?:string,transactionId?:string): Promise<WebhookResponse>;
  rescheduleAppointmentNotification(data: { email: string; time: string }): Promise<RescheduleRepositoryResponse>;
  createAdminBlockNotification(data: { email: string; reason: string }): Promise<AdminBlockRepositoryResponse>;
}