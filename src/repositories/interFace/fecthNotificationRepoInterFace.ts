import { INotificationResponse } from "../../notificationTypes";

export interface IfecthNotificationRepository{
    FetchNotification__Repo(email:string):Promise<INotificationResponse>;
    
}