import {  INotificationResponsee } from "repositories/implementation/fecthNotificationRepo";

export interface IFetchNotificationRepository {
  fetchNotifications(email: string): Promise<INotificationResponsee>;
}