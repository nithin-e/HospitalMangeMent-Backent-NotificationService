import { ObjectId, Model } from "mongoose";
import { INotification, NotificationModel } from "../../entities/notification_Schema";
import { IFetchNotificationRepository } from "../interFace/fecthNotificationRepoInterFace";
import { BaseRepository } from "./baseRepo";

export interface INotificationResponseData {
  id?: string; 
  email: string;
  message: string;
  type: 'PAYMENT' | 'INFO' | 'ALERT';
  paymentAmount?: number;
  paymentLink?: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface INotificationResponsee {
  success: boolean;
  notification: INotificationResponseData[]; 
}

export default class FetchNotificationRepo extends BaseRepository<INotification> implements IFetchNotificationRepository {
  
  constructor(model?: Model<INotification>) {
    // Pass the model to the parent BaseRepository constructor
    super(model || NotificationModel);
  }
       
  async fetchNotifications(email: string): Promise<INotificationResponsee> {
    try {
      const notifications = await this.findOne({ email });

      if (!notifications) {
        return { 
          success: false, 
          notification: [] 
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
        updatedAt: notifications.updatedAt
      };
      
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