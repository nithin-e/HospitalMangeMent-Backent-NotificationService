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
  
  interface WebhookServiceResponse {
    success: boolean;
    message: string;
  }
  
  export interface IstoreNotificationService {
    StoreNotification_Data(data: NotificationRequest): Promise<NotificationServiceResponse>;
    processWebhookEvent(eventType: string, eventData: WebhookEventData): Promise<WebhookServiceResponse>;
    rescheduleAppointment__Notification(data: RescheduleRequest): Promise<RescheduleServiceResponse>;
    creatingNotification_AdminBlock(data: AdminBlockRequest): Promise<AdminBlockServiceResponse>;
  }