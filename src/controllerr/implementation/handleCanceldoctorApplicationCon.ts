import * as grpc from '@grpc/grpc-js';
// import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { IhandleCanceldoctorApplicationController } from '../interFace/handleCanceldoctorApplicationInterface';
import handleCanceldoctorApplicationInService from "../../Servicess/implementation/handleCanceldoctorApplicationInService";

export default class HandleCanceldoctorApplicationController implements IhandleCanceldoctorApplicationController{
  private handleCanceldoctorApplicationInService: handleCanceldoctorApplicationInService;

  constructor(handleCanceldoctorApplicationInService: handleCanceldoctorApplicationInService) {
    this.handleCanceldoctorApplicationInService=handleCanceldoctorApplicationInService
  }

  handleCanceldoctor_Application = async (call: any, callback: any) => {
    try {
      console.log('notification controller request:', call.request);
      
      // Extract email and reasons from the request
      const { email, reasons } = call.request;
      
      // Get the database response
      const dbResponse = await this.handleCanceldoctorApplicationInService.handleCancel_doctor_Application({
        email, reasons
      });
      
      console.log('Notification created: in note controller', dbResponse);
      
      // Map the MongoDB document to the proto Notification message format
      const notificationProto = {
        user_id: email,  // Assuming email is used as user_id
        title: "Application Rejected",  // Add a title
        message: dbResponse.message,
        type: this.mapNotificationType(dbResponse.type),  // Map string type to enum
        is_read: dbResponse.isRead,
        created_at: this.dateToTimestamp(dbResponse.createdAt),
        payment_amount: dbResponse.paymentAmount || 0,
        payment_link: dbResponse.paymentLink || "",
        payment_status: this.mapPaymentStatus(dbResponse.paymentStatus)
      };
      
      // Return the properly formatted notification
      callback(null, { notification: notificationProto });
    } catch (error) {
      console.log('Error in notification controller:', error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  }

  // Helper method to convert string notification type to proto enum
  private mapNotificationType(type: string): number {
    switch (type) {
      case 'INFO':
        return 1; // TYPE_INFO
      case 'APPROVAL':
        return 2; // TYPE_APPROVAL
      case 'PAYMENT':
        return 3; // TYPE_PAYMENT
      case 'ALERT':
        return 4; // TYPE_ALERT
      default:
        return 0; // TYPE_UNSPECIFIED
    }
  }

  // Helper method to convert string payment status to proto enum
  private mapPaymentStatus(status: string): number {
    switch (status) {
      case 'PENDING':
        return 1; // PENDING
      case 'COMPLETED':
        return 2; // COMPLETED
      case 'FAILED':
        return 3; // FAILED
      default:
        return 0; // STATUS_UNSPECIFIED
    }
  }

  // Helper method to convert JavaScript Date to Protobuf Timestamp
  private dateToTimestamp(date: Date): any {
    const timestamp = new Date(date).getTime();
    const seconds = Math.floor(timestamp / 1000);
    const nanos = (timestamp % 1000) * 1000000;
    
    return { seconds: seconds, nanos: nanos };
  }
}