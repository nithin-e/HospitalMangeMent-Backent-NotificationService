import {
  CancelDoctorApplicationInput,
  CancelDoctorApplicationOutput,
} from "interfaces/types";
import { NotificationModel } from "../../entities/notification_Schema";
import { ICancelDoctorApplicationRepository } from "../interFace/ICanceldoctorApplicationRepository";

export default class CancelDoctorApplicationRepository
  implements ICancelDoctorApplicationRepository
{
  /**
   * Stores a rejection notification for a doctor application.
   *
   * @param data - Email and rejection reasons
   * @returns Saved notification object
   */
  handleCancelDoctorApplication = async (
    data: CancelDoctorApplicationInput
  ): Promise<CancelDoctorApplicationOutput> => {
    try {
      const rejectionMessage =
        data.reasons.length > 0
          ? `Your doctor application has been rejected for the following reasons: ${data.reasons.join(
              ", "
            )}`
          : "Your doctor application has been rejected.";

      const newNotification = {
        email: data.email,
        message: rejectionMessage,
        type: "ALERT" as const,
        isRead: false,
        createdAt: new Date(),
        paymentStatus: "PENDING" as const,
      };

      const savedNotification = await NotificationModel.create(newNotification);

      return savedNotification.toObject() as CancelDoctorApplicationOutput;
    } catch (error) {
      console.error("Error in repository when creating notification:", error);
      throw error;
    }
  };
}
