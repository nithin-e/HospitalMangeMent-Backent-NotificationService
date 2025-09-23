import * as grpc from "@grpc/grpc-js";
import { IStoreNotificationService } from "../../Services/interFace/IStoreNotificationService";
import {
  GrpcCallback,
  GrpcCalls,
  IEventData,
  StoreNotificationResponse,
} from "interfaces/types";

import { StoreNotificationMapper } from "mappers/StoreNotificationMapper";
import { GrpcErrorHandler } from "utility/GrpcErrorHandler";

export default class StoreNotificationController {
  private _storeNotificationService: IStoreNotificationService;

  constructor(storeNotificationService: IStoreNotificationService) {
    this._storeNotificationService = storeNotificationService;
  }

  /**
   * Stores a new notification in the database.
   *
   * @param call - gRPC request with email
   * @param callback - gRPC callback with response
   */

  storeNotificationData = async (
    call: GrpcCalls,
    callback: GrpcCallback<StoreNotificationResponse>
  ): Promise<void> => {
    try {
      const { email } = call.request;

      if (!email) {
        throw new Error("Email is required");
      }

      const dbResponse =
        await this._storeNotificationService.storeNotificationData({ email });

      const { notification } = dbResponse;

      const protoNotification =
        StoreNotificationMapper.toGrpcResponse(notification);

      callback(null, { notification: protoNotification });
    } catch (error) {
      callback(GrpcErrorHandler.internal(error), null);
      throw error;
    }
  };
  /**
   * Processes Stripe webhook events to update notifications.
   *
   * @param eventType - webhook payload with email and transactionId
   */
  handleStripeWebhook = async (eventType: IEventData): Promise<void> => {
    try {
      const email = eventType.email;
      const transactionId = eventType.transactionId;
      const result = await this._storeNotificationService.processWebhookEvent(
        email,
        transactionId
      );

      if (result) {
        console.log(
          "Notification deleted succesfully for email:",
          eventType.email
        );
      }
    } catch (error) {
      console.error("error in handlestripewebhook:", error);
      throw error;
    }
  };

  /**
   * Sends a notification when an appointment is rescheduled.
   *
   * @param call - gRPC request with email and time
   * @param callback - gRPC callback with success response
   */
  rescheduleAppointmentNotification = async (
    call: GrpcCalls,
    callback: GrpcCallback
  ): Promise<void> => {
    try {
      const { email, time } = call.request;

      if (!email || !time) {
        const error = {
          code: grpc.status.INVALID_ARGUMENT,
          message: "Email and time are required",
        };
        return callback(error, null);
      }

      await this._storeNotificationService.rescheduleAppointmentNotification({
        email,
        time,
      });

      callback(null, { success: true });
    } catch (error) {
      callback(GrpcErrorHandler.internal(error), null);
    }
  };

  /**
   * Creates a notification when an admin blocks a doctor.
   *
   * @param call - gRPC request with email and reason
   * @param callback - gRPC callback with success response
   */
  createAdminBlockNotification = async (
    call: GrpcCalls,
    callback: GrpcCallback
  ): Promise<void> => {
    try {
      const { email, reason } = call.request;

      const dbResponse =
        await this._storeNotificationService.createAdminBlockNotification({
          email,
          reason,
        });

      callback(null, dbResponse);
    } catch (error) {
      callback(GrpcErrorHandler.internal(error), null);
      throw error;
    }
  };
}
