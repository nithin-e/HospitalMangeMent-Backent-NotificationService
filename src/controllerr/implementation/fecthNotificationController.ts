import * as grpc from '@grpc/grpc-js';
import { ServerUnaryCall, sendUnaryData, ServiceError } from '@grpc/grpc-js';
import { IfecthNotificationService } from '../../Servicess/interFace/fecthNotificationServiceInterFace';
import { IFormattedNotification, IGrpcNotificationResponse, INotificationResponse } from '../../notificationTypes';

export default class FetchingNotifications  {
  private FecthNotificationService: IfecthNotificationService;

  constructor(FecthNotificationService: IfecthNotificationService) {
    this.FecthNotificationService = FecthNotificationService;
  }
  



  async fetchingNotification(
    call: ServerUnaryCall<Record<string, never>,IGrpcNotificationResponse>, 
    callback: sendUnaryData<IGrpcNotificationResponse>
  ): Promise<IGrpcNotificationResponse> {
    try {
      const { email } = call.request;
      console.log('Fetching notifications for email:', email);

      if (!email) {
        throw new Error('Email is required');
      }

      if (!this.FecthNotificationService) {
        throw new Error('FecthNotificationService is not initialized');
      }

      const response: INotificationResponse = await this.FecthNotificationService.fetching_Notifications(email);
      console.log('controller res', response);

      
      const formattedNotifications: IFormattedNotification[] = response.notification.map(notification => {
        
        // if (!notification.id) {
        //   throw new Error('Invalid notification: missing ID');
        // }
        
        return {
          id: notification.id,
          user_id: notification.email,
          message: notification.message,
          type: this.getNotificationType(notification.type),
          is_read: notification.isRead,
          created_at: this.timestampFromDate(notification.createdAt),
          payment_amount: notification.paymentAmount || 0,
          payment_link: notification.paymentLink || '',
          payment_status: this.getPaymentStatus(notification.paymentStatus)
        };
      });

      const notificationResponse: IGrpcNotificationResponse = {
        notification: formattedNotifications,
        success: response.success
      };

      callback(null, notificationResponse);
      return notificationResponse;
    } catch (error) {
      console.log('Error in notification controller:', error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
      throw error;
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