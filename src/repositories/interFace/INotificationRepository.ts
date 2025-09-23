import { INotificationsResponse } from "interfaces/types";

export interface IFetchNotificationRepository {
  fetchNotifications(email: string): Promise<INotificationsResponse>;
}