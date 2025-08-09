// Request types (same as service layer)
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
  
  // Response types
  interface NotificationRepositoryResponse {
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
  
  interface PaymentStatusUpdateResponse {
    success: boolean;
  }
  
  export interface IstoreNotificationRepository {
    storingNotification_Datas(data: NotificationRequest): Promise<NotificationRepositoryResponse>;
    updatePaymentStatus(email: string, status: string, transactionId?: string): Promise<boolean>;
    reschedule_Appointment__Notification(data: RescheduleRequest): Promise<RescheduleRepositoryResponse>;
    creatingNotification__AdminBlock(data: AdminBlockRequest): Promise<AdminBlockRepositoryResponse>;
  }