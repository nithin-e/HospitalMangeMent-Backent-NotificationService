import { ObjectId, Model } from "mongoose";
import {
  INotification,
  NotificationModel,
} from "../../entities/notification_Schema";
import { IFetchNotificationRepository } from "../interFace/INotificationRepository";
import { BaseRepository } from "./baseRepo";
import {
  INotificationResponseData,
  INotificationsResponse,
} from "interfaces/types";

export default class FetchNotificationRepo
  extends BaseRepository<INotification>
  implements IFetchNotificationRepository
{
  constructor(model?: Model<INotification>) {
    super(model || NotificationModel);
  }

  /**
   * Fetch all notifications for a specific user by email.
   *
   * @param email - User's email
   * @returns Notifications response object
   */
  async fetchNotifications(email: string): Promise<INotificationsResponse> {
    try {
      const notifications = await this.findOne({ email });

      if (!notifications) {
        return {
          success: false,
          notification: [],
        };
      }

      const notificationData: INotificationResponseData = {
        id: (notifications._id as ObjectId).toString(),
        email: notifications.email,
        message: notifications.message,
        type: notifications.type,
        paymentAmount: notifications.paymentAmount,
        paymentLink: notifications.paymentLink,
        paymentStatus: notifications.paymentStatus,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        updatedAt: notifications.updatedAt,
      };

      return {
        success: true,
        notification: [notificationData],
      };
    } catch (error) {
      console.error("Error in repository:", error);
      throw error;
    }
  }
}
