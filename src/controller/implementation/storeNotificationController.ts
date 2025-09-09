import * as grpc from "@grpc/grpc-js";
import { IStoreNotificationService } from "../../Services/interFace/storeNotificationServiceInterFace";

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


interface GrpcError {
  code: number;
  message: string;
}

interface GrpcCallback<TResponse = unknown> {
  (error: GrpcError | null, response: TResponse | null): void;
}
interface StoreNotificationResponse {
  notification: ProtoNotification;
}



interface IEventData {
  email?: string;
  transactionId?: string;
}

function convertTypeToProtoEnum(type: string): number {
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

function convertStatusToProtoEnum(status: string): number {
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

function dateToTimestamp(date: Date): { seconds: number; nanos: number } {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanos = (date.getTime() % 1000) * 1000000;
  return { seconds, nanos };
}

export default class StoreNotificationController {
  private _storeNotificationService: IStoreNotificationService;

  constructor(storeNotificationService: IStoreNotificationService) {
    this._storeNotificationService = storeNotificationService;
  }

  storeNotificationData = async (
    call: GrpcCall,
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
        payment_status: convertStatusToProtoEnum(notification.paymentStatus),
      };

      callback(null, { notification: protoNotification });
    } catch (error) {
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  };

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

  rescheduleAppointmentNotification = async (
    call: GrpcCall,
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
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  };

  createAdminBlockNotification = async (
    call: GrpcCall,
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
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  };
}
