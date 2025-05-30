import { IfecthNotificationService } from "../interFace/fecthNotificationServiceInterFace";
import FecthNotificationRepository from "../../repositories/implementation/fecthNotificationRepo";

export default class FecthNotificationService implements IfecthNotificationService {
    private fecthNotificationRepository: FecthNotificationRepository;
    
    constructor(fecthNotificationRepo: FecthNotificationRepository) {
        this.fecthNotificationRepository = fecthNotificationRepo;
    }
    
    fetching_Notifications = async (email: string) => {
        try {
          console.log('Service fetching notifications for:', email);
          const response = await this.fecthNotificationRepository.FetchNotification__Repo(email);
          console.log('Service received response:', response);
          return response;
        } catch (error) {
          console.error('Error in notification service:', error);
          throw error;
        }
    }
}