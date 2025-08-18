import {NotificationModel} from "../../entities/notification_Schema";
import { INotification, INotificationResponse } from "../../notificationTypes";
import {  IFetchNotificationRepository } from "../interFace/fecthNotificationRepoInterFace";


 export default class FetchNotificationRepo implements IFetchNotificationRepository {
       
        
  async fetchNotifications(email: string): Promise<INotificationResponse> {
    try {
      const notifications = await NotificationModel.findOne({ email })

      if (!notifications) {
        return { 
          success: false, 
          notification: [] 
        };
      }

  
      const notificationData: INotification = {
         id: notifications._id,
        email: notifications.email,
        message: notifications.message,
        type: notifications.type,
        paymentAmount: notifications.paymentAmount,
        paymentLink: notifications.paymentLink,
        paymentStatus: notifications.paymentStatus,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        updatedAt: notifications.updatedAt
      };

      console.log('repo res', notificationData);
      
      return { 
        success: true, 
        notification: [notificationData] 
      };
    } catch (error) {
      console.error('Error in repository:', error);
      throw error;
    }


      }

    }