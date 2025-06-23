import * as grpc from '@grpc/grpc-js';
import storeNotificationservice from "../../Servicess/implementation/storeNotificationservice";
import { IstoreNotificationController } from '../interFace/storeNotificationInterFace';

/**
 * Helper function to convert string notification type to proto enum value
 */
function convertTypeToProtoEnum(type: string): number {
  switch(type) {
    case 'INFO': return 1;
    case 'APPROVAL': return 2;
    case 'PAYMENT': return 3;
    case 'ALERT': return 4;
    default: return 0;
  }
}

/**
 * Helper function to convert string payment status to proto enum value
 */
function convertStatusToProtoEnum(status: string): number {
  switch(status) {
    case 'PENDING': return 1;
    case 'COMPLETED': return 2;
    case 'FAILED': return 3;
    default: return 0;
  }
}

/**
 * Helper function to convert JavaScript Date to Protobuf Timestamp
 */
function dateToTimestamp(date: Date): any {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanos = (date.getTime() % 1000) * 1000000;
  return { seconds, nanos };
}

export default class StoreNotificationController implements IstoreNotificationController {
  private storeNotificationservice: storeNotificationservice;

  constructor(storeNotificationservice: storeNotificationservice) {
    this.storeNotificationservice = storeNotificationservice
  }

  storeNotificationData = async (call: any, callback: any) => {
    try {
      console.log('notification controller request:', call.request);
      
      // Extract email from the request
      const { email } = call.request;
      
      if (!email) {
        throw new Error('Email is required');
      }
      
      const dbResponse = await this.storeNotificationservice.StoreNotification_Data({
        email
      });
      
      console.log('Notification created: in note controller', dbResponse);
      
      
      const { notification } = dbResponse;
      
      const protoNotification = {
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
      console.log('Error in notification controller:', error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  }

  handleStripeWebhook = async (call: any, callback: any) => {
    try {
      console.log('Full gRPC call object:', call.request);
     
      
      if (!call.request.event_data || call.request.event_data === '') {
        console.warn('Empty event_data received in webhook');
        callback(null, { 
          success: false, 
          message: 'Empty event data received' 
        });
        return;
      }
      
      const eventData = JSON.parse(call.request.event_data);
      const eventType = call.request.event_type || 'unknown';
      
      console.log(`Processing inside controller ${eventType} event`);
      
      const result = await this.storeNotificationservice.processWebhookEvent(eventType, eventData);
      
      callback(null, result);
    } catch (error) {
      console.error('Error handling webhook:', error);
      callback(null, { 
        success: false, 
        message: `Error handling webhook: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  }

  rescheduleAppointmentNotification = async (call: any, callback: any) => {
    try {
      const { email, time } = call.request;
      
     
      if (!email || !time) {
        const error = {
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Email and time are required'
        };
        return callback(error, null);
      }
      
      const dbResponse = await this.storeNotificationservice.rescheduleAppointment__Notification({
        email,
        time
      });
  
      // Return success response
      callback(null, {
        success: true
      });
  
    } catch (error) {
      console.log('Error in notification controller:', error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  }
}