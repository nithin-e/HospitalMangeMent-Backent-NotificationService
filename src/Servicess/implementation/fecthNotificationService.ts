import { IfecthNotificationService } from "../interFace/fecthNotificationServiceInterFace";
import FecthNotificationRepository from "../../repositories/implementation/fecthNotificationRepo";
import { IfecthNotificationRepository } from "../../repositories/interFace/fecthNotificationRepoInterFace";
import { INotificationResponse } from "../../notificationTypes";

export default class FecthNotificationService implements IfecthNotificationService {
    private fecthNotificationRepository: IfecthNotificationRepository;
    
    constructor(fecthNotificationRepo: IfecthNotificationRepository) {
        this.fecthNotificationRepository = fecthNotificationRepo;
    }
    
    async fetching_Notifications(email: string): Promise<INotificationResponse> {
      try {
        console.log('Service fetching notifications for:', email);
        
        if (!email) {
          throw new Error('Email is required');
        }
  
        const response: INotificationResponse = await this.fecthNotificationRepository.FetchNotification__Repo(email);
        console.log('Service received response:', response);
        
        return response;
      } catch (error) {
        console.error('Error in notification service:', error);
        throw error;
      }
    }
}