import * as grpc from '@grpc/grpc-js';
import { ServerUnaryCall } from '@grpc/grpc-js';
import { IfecthNotificationController } from '../interFace/fecthNotificationInterFace';
import FecthNotificationService from "../../Servicess/implementation/fecthNotificationService";

export default class FetchingNotifications implements IfecthNotificationController {
  private FecthNotificationService: FecthNotificationService;

  constructor(FecthNotificationService: FecthNotificationService) {
    this.FecthNotificationService = FecthNotificationService;
  }

  async fetchingNotification(call: ServerUnaryCall<any, any>, callback: (error: any, response: any) => void): Promise<any> {
    try {
      const { email } = call.request;
      console.log('Fetching notifications for email:', email);
      
      // Verify that the service exists
      if (!this.FecthNotificationService) {
        throw new Error('FecthNotificationService is not initialized');
      }
      
      const response = await this.FecthNotificationService.fetching_Notifications(email);
      console.log('controller res', response);
      
      // Format the notifications array to match the protobuf structure
      const notificationsArray = Array.isArray(response.notification) 
        ? response.notification
        : response.notification ? [response.notification] : [];
      
      // Map each notification to the expected format
      const formattedNotifications = notificationsArray.map(notification => ({
        id: notification.id.toString(),
        user_id: notification.email,
        // title: notification?.title || '', // Add title if available in your schema
        message: notification.message,
        type: this.getNotificationType(notification.type),
        is_read: notification.isRead,
        created_at: this.timestampFromDate(notification.createdAt),
        payment_amount: notification.paymentAmount || 0,
        payment_link: notification.paymentLink || '',
        payment_status: this.getPaymentStatus(notification.paymentStatus)
      }));
      
      // Create the response object with the array of notifications and success status
      const notificationResponse = {
        notification: formattedNotifications,
        success: response.success
      };
      
      // Send the response through the gRPC callback
      callback(null, notificationResponse);
      return notificationResponse; // Return the response to satisfy the Promise<any> return type
    } catch (error) {
      console.log('Error in notification controller:', error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
      throw error; // Re-throw to satisfy the Promise<any> return type
    }
  }
  
  // Helper methods moved to class methods
  private getNotificationType(type: string): number {
    switch (type) {
      case 'INFO': return 1;
      case 'APPROVAL': return 2;
      case 'PAYMENT': return 3;
      case 'ALERT': return 4;
      default: return 0; // TYPE_UNSPECIFIED
    }
  }
  
  private getPaymentStatus(status: string): number {
    switch (status) {
      case 'PENDING': return 1;
      case 'COMPLETED': return 2;
      case 'FAILED': return 3;
      default: return 0; // STATUS_UNSPECIFIED
    }
  }
  
  private timestampFromDate(date: Date | string | undefined) {
    if (!date) return null;
    
    const milliseconds = new Date(date).getTime();
    return {
      seconds: Math.floor(milliseconds / 1000),
      nanos: (milliseconds % 1000) * 1000000
    };
  }
}