import { INotificationResponsee } from "repositories/implementation/fecthNotificationRepo";
import { INotificationResponse } from "../../notificationTypes";

export interface IFetchNotificationService {
  fetchNotifications(email: string): Promise<INotificationResponsee>;
}