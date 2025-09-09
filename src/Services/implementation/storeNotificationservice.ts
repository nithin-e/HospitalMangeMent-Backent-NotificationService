import { IStoreNotificationService } from "../interFace/storeNotificationServiceInterFace";
import StoreNotificationRepository, {
  NotificationData,
  RescheduleData,
  AdminBlockData,
  NotificationResponse,
  RescheduleResponse,
  AdminBlockResponse,
} from "../../repositories/implementation/storeNotificationRepo";
import { IStoreNotificationRepository } from "../../repositories/interFace/storeNotificationRepoInterFace";
import { UserService } from "../../protoConfig/user.client";

export interface WebhookEventData {
  type: string;
  data: {
    object: {
      metadata?: {
        email?: string;
        transactionId?: string;
      };
      [key: string]: any;
    };
  };
}

export interface WebhookResponse {
  success: boolean;
  message: string;
}

export default class StoreNotificationService
  implements IStoreNotificationService
{
  private _storeNotificationRepo: IStoreNotificationRepository;

  constructor(storeNotificationRepo: IStoreNotificationRepository) {
    this._storeNotificationRepo = storeNotificationRepo;
  }

  storeNotificationData = async (
    data: NotificationData
  ): Promise<NotificationResponse> => {
    try {
      const response = await this._storeNotificationRepo.storeNotificationData(
        data
      );
      console.log("check this response after storing notification", response);

      const updateUserStatus = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
          UserService.UpdateDoctorStatusAfterAdminApprove(
            { email: data.email },
            (err: Error | null, grpcResponse: { success: boolean }) => {
              if (err) {
                console.error("Error updating user status:", err);
                reject(err);
                return;
              }

              console.log("Successfully updated doctor:", grpcResponse);
              resolve(grpcResponse.success);
            }
          );
        });
      };

      try {
        const updateResult = await updateUserStatus();

        if (!updateResult) {
          throw new Error("Failed to update doctor status");
        }

        console.log("Doctor status updated successfully");
        return response;
      } catch (updateError) {
        console.error("Error updating doctor status:", updateError);

        throw new Error(
          "Notification created but failed to update user status"
        );
      }
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  };

  // after the payment changing the user role
  async processWebhookEvent(
    email: string,
    transactionId: string
  ): Promise<WebhookResponse> {
    try {
      if (!email) {
        return {
          success: false,
          message: "Email not found in session metadata",
        };
      }

      const updated = await this._storeNotificationRepo.updatePaymentStatus(
        email,
        "COMPLETED",
        transactionId
      );

      return {
        success: true,
        message: "Event acknowledged but no action taken",
      };
    } catch (error) {
      console.error("Error processing webhook event:", error);
      return {
        success: false,
        message: `Error processing webhook: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  rescheduleAppointmentNotification = async (
    data: RescheduleData
  ): Promise<RescheduleResponse> => {
    try {
      return await this._storeNotificationRepo.rescheduleAppointmentNotification(
        data
      );
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  };

  createAdminBlockNotification = async (
    data: AdminBlockData
  ): Promise<AdminBlockResponse> => {
    try {
      return await this._storeNotificationRepo.createAdminBlockNotification(
        data
      );
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  };
}
