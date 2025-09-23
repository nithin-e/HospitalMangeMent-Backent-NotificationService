import { IFetchNotificationService } from "../interFace/INotificationService";
import { IFetchNotificationRepository } from "../../repositories/interFace/INotificationRepository";
import { INotificationsResponse } from "interfaces/types";

export default class FecthNotificationService
  implements IFetchNotificationService
{
  private _fetchNotificationRepository: IFetchNotificationRepository;

  constructor(fetchNotificationRepo: IFetchNotificationRepository) {
    this._fetchNotificationRepository = fetchNotificationRepo;
  }

  /**
   * Retrieves all notifications for a given user.
   *
   * @param email - User's email
   * @returns List of notifications
   */

  async fetchNotifications(email: string): Promise<INotificationsResponse> {
    try {
      console.log("Service fetching notifications for:", email);

      if (!email) {
        throw new Error("Email is required");
      }

      const response: INotificationsResponse =
        await this._fetchNotificationRepository.fetchNotifications(email);

      return response;
    } catch (error) {
      console.error("Error in notification service:", error);
      throw error;
    }
  }
}
