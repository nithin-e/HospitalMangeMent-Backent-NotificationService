import * as grpc from '@grpc/grpc-js';
import { IStoreNotificationService } from '../../Services/interFace/storeNotificationServiceInterFace';


interface ProtoNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: number;
  is_read: boolean;
  created_at: { seconds: number; nanos: number };
  payment_amount: number;
  payment_link: string;
  payment_status: number;
}

interface GrpcCall {
  request: any;
}

interface GrpcCallback {
  (error: any, response: any): void;
}

function convertTypeToProtoEnum(type: string): number {
  switch(type) {
    case 'INFO': return 1;
    case 'APPROVAL': return 2;
    case 'PAYMENT': return 3;
    case 'ALERT': return 4;
    default: return 0;
  }
}

function convertStatusToProtoEnum(status: string): number {
  switch(status) {
    case 'PENDING': return 1;
    case 'COMPLETED': return 2;
    case 'FAILED': return 3;
    default: return 0;
  }
}

function dateToTimestamp(date: Date): { seconds: number; nanos: number } {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanos = (date.getTime() % 1000) * 1000000;
  return { seconds, nanos };
}

export default class StoreNotificationController   {
  private storeNotificationservice: IStoreNotificationService;

  constructor(storeNotificationservice: IStoreNotificationService) {
    this.storeNotificationservice = storeNotificationservice;
  }

  storeNotificationData  = async (call: GrpcCall, callback: GrpcCallback): Promise<void> => {
    try {
      const { email } = call.request;
      
      if (!email) {
        throw new Error('Email is required');
      }
      
      const dbResponse = await this.storeNotificationservice.storeNotificationData({ email });
      
      const { notification } = dbResponse;
      
      const protoNotification: ProtoNotification = {
        id: notification.id.toString(),
        user_id: notification.email || "",
        title: "",
        message: notification.message,
        type: convertTypeToProtoEnum(notification.type),
        is_read: notification.isRead,
        created_at: dateToTimestamp(notification.createdAt),
        payment_amount: Number(notification.paymentAmount) || 0,
        payment_link: notification.paymentLink || "",
        payment_status: convertStatusToProtoEnum(notification.paymentStatus)
      };
      
      callback(null, { notification: protoNotification });

         

    } catch (error) {
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  }
  

  handleStripeWebhook  = async (call: GrpcCall, callback: GrpcCallback): Promise<void> => {
    try {
      if (!call.request.event_data) {
        callback(null, { 
          success: false, 
          message: 'Empty event data received' 
        });
        return;
      }
      
      const eventData = JSON.parse(call.request.event_data);
      const eventType = call.request.event_type || 'unknown';
      
      const result = await this.storeNotificationservice.processWebhookEvent(eventType, eventData);
      
      callback(null, result);
    } catch (error) {
      callback(null, { 
        success: false, 
        message: `Error handling webhook: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  }

  rescheduleAppointmentNotification  = async (call: GrpcCall, callback: GrpcCallback): Promise<void> => {
    try {
      const { email, time } = call.request;
      
      if (!email || !time) {
        const error = {
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Email and time are required'
        };
        return callback(error, null);
      }
      
      await this.storeNotificationservice.rescheduleAppointmentNotification({ email, time });
  
      callback(null, { success: true });
    } catch (error) {
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  }

  createAdminBlockNotification  = async (call: GrpcCall, callback: GrpcCallback): Promise<void> => {
    try {
      const { email, reason } = call.request;
      
      const dbResponse = await this.storeNotificationservice.createAdminBlockNotification({
        email,
        reason
      });
         
      callback(null, dbResponse);
    } catch (error) {
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  }
}