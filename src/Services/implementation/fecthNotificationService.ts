import { IFetchNotificationService } from "../interFace/fecthNotificationServiceInterFace";
import { IFetchNotificationRepository } from "../../repositories/interFace/fecthNotificationRepoInterFace";
import { INotificationResponse } from "../../notificationTypes";

export default class FecthNotificationService
  implements IFetchNotificationService
{
  private _fetchNotificationRepository: IFetchNotificationRepository;

  constructor(fetchNotificationRepo: IFetchNotificationRepository) {
    this._fetchNotificationRepository = fetchNotificationRepo;
  }

  async fetchNotifications(email: string): Promise<INotificationResponse> {
    try {
      console.log("Service fetching notifications for:", email);

      if (!email) {
        throw new Error("Email is required");
      }

      const response: INotificationResponse =
        await this._fetchNotificationRepository.fetchNotifications(email);

      return response;
    } catch (error) {
      console.error("Error in notification service:", error);
      throw error;
    }
  }
}
