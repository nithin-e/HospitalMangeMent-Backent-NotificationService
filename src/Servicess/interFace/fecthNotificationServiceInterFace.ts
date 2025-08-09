import { INotificationResponse } from "../../notificationTypes";

export interface IfecthNotificationService{
    fetching_Notifications(email:string):Promise<INotificationResponse>;
    
}