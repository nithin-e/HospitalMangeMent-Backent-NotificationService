import * as grpc from "@grpc/grpc-js";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { IFetchNotificationService } from "../../Services/interFace/INotificationService";
import { IGrpcNotificationResponse } from "../../notificationTypes";
import { INotificationsResponse } from "interfaces/types";
import { NotificationMapper } from "mappers/notification.mapper";
import { GrpcErrorHandler } from "utility/GrpcErrorHandler";

export default class NotificationController {
  private _fetchNotificationService: IFetchNotificationService;

  constructor(fetchNotificationService: IFetchNotificationService) {
    this._fetchNotificationService = fetchNotificationService;
  }

  /**
   * Fetch notifications for a user by email.
   * Validates request, calls service, maps response, and handles errors.
   *
   * @param call - gRPC request containing user email
   * @param callback - gRPC callback for response or error
   */

  async fetchNotifications(
    call: ServerUnaryCall<Record<string, never>, IGrpcNotificationResponse>,
    callback: sendUnaryData<IGrpcNotificationResponse>
  ): Promise<IGrpcNotificationResponse> {
    try {
      const { email } = call.request;

      if (!email) {
        throw new Error("Email is required");
      }

      const response: INotificationsResponse =
        await this._fetchNotificationService.fetchNotifications(email);

      const notificationResponse = NotificationMapper.toGrpcResponse(response);

      callback(null, notificationResponse);
      return notificationResponse;
    } catch (error) {
      console.log("Error in notification controller:", error);
      console.error("Error in notification controller:", error);
      callback(GrpcErrorHandler.internal(error), null);
      throw error;
    }
  }
}
