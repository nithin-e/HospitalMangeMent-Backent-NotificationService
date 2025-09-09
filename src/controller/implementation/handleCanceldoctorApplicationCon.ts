import * as grpc from "@grpc/grpc-js";
import { ServiceCancelDoctorApplicationOutput } from "../../Services/implementation/handleCanceldoctorApplicationInService";
import { ICancelDoctorApplicationService } from "../../Services/interFace/handleCanceldoctorApplicationInInterFace";

// Types for controller layer
export interface GrpcCallRequest {
  email: string;
  reasons: string[];
}

export interface GrpcCall {
  request: GrpcCallRequest;
}

type GrpcError = Error | { code: number; message: string; details?: string };

export interface GrpcCallback {
  (error: GrpcError | null, response?: { notification: NotificationProtoResponse }): void;
}

export interface NotificationProtoResponse {
  user_id: string;
  title: string;
  message: string;
  type: number;
  is_read: boolean;
  created_at: TimestampProto;
  payment_amount: number;
  payment_link: string;
  payment_status: number;
}

export interface TimestampProto {
  seconds: number;
  nanos: number;
}

export default class HandleCancelDoctorApplicationController {
  private _handleCancelDoctorApplicationService: ICancelDoctorApplicationService;

  constructor(
    handleCancelDoctorApplicationService: ICancelDoctorApplicationService
  ) {
    this._handleCancelDoctorApplicationService =
      handleCancelDoctorApplicationService;
  }

  handleCancelDoctorApplication = async (
    call: GrpcCall,
    callback: GrpcCallback
  ): Promise<void> => {
    try {
      console.log("Notification controller request:", call.request);

      if (!call.request.email || !Array.isArray(call.request.reasons)) {
        const grpcError = {
          code: grpc.status.INVALID_ARGUMENT,
          message: "Invalid request: email and reasons array are required",
        };
        callback(grpcError, undefined);
        return;
      }

      const { email, reasons } = call.request;

      const dbResponse: ServiceCancelDoctorApplicationOutput =
        await this._handleCancelDoctorApplicationService.handleCancelDoctorApplication(
          {
            email,
            reasons,
          }
        );

      console.log("Notification created in controller:", dbResponse);

      const notificationProto: NotificationProtoResponse = {
        user_id: email,
        title: "Application Rejected",
        message: dbResponse.message,
        type: this.mapNotificationType(dbResponse.type),
        is_read: dbResponse.isRead,
        created_at: this.dateToTimestamp(dbResponse.createdAt),
        payment_amount: dbResponse.paymentAmount || 0,
        payment_link: dbResponse.paymentLink || "",
        payment_status: this.mapPaymentStatus(dbResponse.paymentStatus),
      };

      callback(null, { notification: notificationProto });
    } catch (error) {
      console.error("Error in notification controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, undefined);
    }
  };

  private mapNotificationType(type: string): number {
    switch (type) {
      case "INFO":
        return 1;
      case "APPROVAL":
        return 2;
      case "PAYMENT":
        return 3;
      case "ALERT":
        return 4;
      default:
        return 0;
    }
  }

  private mapPaymentStatus(status: string): number {
    switch (status) {
      case "PENDING":
        return 1;
      case "COMPLETED":
        return 2;
      case "FAILED":
        return 3;
      default:
        return 0;
    }
  }

  private dateToTimestamp(date: Date): TimestampProto {
    const timestamp = new Date(date).getTime();
    const seconds = Math.floor(timestamp / 1000);
    const nanos = (timestamp % 1000) * 1000000;

    return { seconds, nanos };
  }
}
