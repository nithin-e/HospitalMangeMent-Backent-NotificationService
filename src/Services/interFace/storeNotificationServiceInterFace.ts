// Request types
interface NotificationRequest {
    email: string;
  }
  
  interface RescheduleRequest {
    email: string;
    time: string;
  }
  
  interface AdminBlockRequest {
    email: string;
    reason: string;
  }
  
  interface WebhookEventData {
    type: string;
    data: {
      object: {
        metadata?: {
          email?: string;
          transactionId?: string;
        };
        [key: string]: any;
      };
    };
  }
  
  // Response types
  interface NotificationServiceResponse {
    notification: any; // Replace with your actual notification type
  }
  
  interface RescheduleServiceResponse {
    success: boolean;
    notification?: any;
    message?: string;
  }
  
  interface AdminBlockServiceResponse {
    success: boolean;
    error?: string;
    message?: string;
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
  

//   export interface IStoreNotificationService {
//   storeNotificationData(data: NotificationRequest): Promise<NotificationServiceResponse>;
//   processWebhookEvent(eventType: string, eventData: any): Promise<any>;
//   rescheduleAppointmentNotification(data: { email: string; time: string }): Promise<any>;
//   createAdminBlockNotification(data: { email: string; reason: string }): Promise<any>;
// }
  export interface IStoreNotificationService {
  storeNotificationData(data: NotificationRequest): Promise<NotificationServiceResponse>;
  processWebhookEvent(eventType: string, eventData: WebhookEventData): Promise<WebhookResponse>;
  rescheduleAppointmentNotification(data: { email: string; time: string }): Promise<RescheduleRepositoryResponse>;
  createAdminBlockNotification(data: { email: string; reason: string }): Promise<AdminBlockRepositoryResponse>;
}