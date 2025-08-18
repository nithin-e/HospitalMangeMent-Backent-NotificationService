import {  IFetchNotificationService } from "../interFace/fecthNotificationServiceInterFace";
import { IFetchNotificationRepository } from "../../repositories/interFace/fecthNotificationRepoInterFace";
import { INotificationResponse } from "../../notificationTypes";

export default class FecthNotificationService implements IFetchNotificationService {
    private fecthNotificationRepository: IFetchNotificationRepository;
    
    constructor(fecthNotificationRepo: IFetchNotificationRepository) {
        this.fecthNotificationRepository = fecthNotificationRepo;
    }
    
    async fetchNotifications(email: string): Promise<INotificationResponse> {
      try {
        console.log('Service fetching notifications for:', email);
        
        if (!email) {
          throw new Error('Email is required');
        }
  
        const response: INotificationResponse = await this.fecthNotificationRepository.fetchNotifications(email);
        console.log('Service received response:', response);
        
        return response;
      } catch (error) {
        console.error('Error in notification service:', error);
        throw error;
      }
    }
}