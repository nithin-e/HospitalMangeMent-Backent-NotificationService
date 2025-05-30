import {NotificationModel} from "../../entities/notification_Schema";
import { IfecthNotificationRepository } from "../interFace/fecthNotificationRepoInterFace";


 export default class FetchNotificationRepo implements IfecthNotificationRepository {
       
        
        FetchNotification__Repo = async (email: string) => {
          try {
            
            const notifications = await NotificationModel.findOne({ email });

            if(!notifications){
              return { success: false, notification: [] };
            }
             console.log('repo res', notifications);
             return { success: true, notification: notifications }; 
          } catch (error) {
            console.error('Error in repository:', error);
            throw error;
          }
        }
      }

