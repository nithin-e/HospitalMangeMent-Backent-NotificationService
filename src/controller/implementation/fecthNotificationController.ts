import * as grpc from "@grpc/grpc-js";
import { ServerUnaryCall, sendUnaryData, ServiceError } from "@grpc/grpc-js";
import { IFetchNotificationService } from "../../Services/interFace/fecthNotificationServiceInterFace";
import {
  IFormattedNotification,
  IGrpcNotificationResponse,
  INotificationResponse,
} from "../../notificationTypes";

export default class NotificationController {
  private _fetchNotificationService: IFetchNotificationService;

  constructor(fetchNotificationService: IFetchNotificationService) {
    this._fetchNotificationService = fetchNotificationService;
  }

  async fetchNotifications(
    call: ServerUnaryCall<Record<string, never>, IGrpcNotificationResponse>,
    callback: sendUnaryData<IGrpcNotificationResponse>
  ): Promise<IGrpcNotificationResponse> {
    try {
      const { email } = call.request;
      console.log("Fetching notifications for email:", email);

      if (!email) {
        throw new Error("Email is required");
      }

      if (!this._fetchNotificationService) {
        throw new Error("FecthNotificationService is not initialized");
      }

      const response: INotificationResponse =
        await this._fetchNotificationService.fetchNotifications(email);

      const formattedNotifications: IFormattedNotification[] =
        response.notification.map((notification) => {
          return {
            id: notification.id,
            user_id: notification.email,
            message: notification.message,
            type: this.getNotificationType(notification.type),
            is_read: notification.isRead,
            created_at: this.timestampFromDate(notification.createdAt),
            payment_amount: notification.paymentAmount || 0,
            payment_link: notification.paymentLink || "",
            payment_status: this.getPaymentStatus(notification.paymentStatus),
          };
        });

      const notificationResponse: IGrpcNotificationResponse = {
        notification: formattedNotifications,
        success: response.success,
      };

      callback(null, notificationResponse);
      return notificationResponse;
    } catch (error) {
      console.log("Error in notification controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
      throw error;
    }
  }

  private getNotificationType(type: string): number {
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

  private getPaymentStatus(status: string): number {
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

  private timestampFromDate(date: Date | string | undefined) {
    if (!date) return null;

    const milliseconds = new Date(date).getTime();
    return {
      seconds: Math.floor(milliseconds / 1000),
      nanos: (milliseconds % 1000) * 1000000,
    };
  }
}
