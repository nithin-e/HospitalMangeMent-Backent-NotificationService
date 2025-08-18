import { INotificationResponse } from "../../notificationTypes";

export interface IFetchNotificationService {
  fetchNotifications(email: string): Promise<INotificationResponse>;
}