import { INotificationsResponse } from "interfaces/types";

export interface IFetchNotificationService {
  fetchNotifications(email: string): Promise<INotificationsResponse>;
}