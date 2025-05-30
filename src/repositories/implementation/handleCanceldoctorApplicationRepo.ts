import {NotificationModel} from "../../entities/notification_Schema";
import { IhandleCanceldoctorApplicationRepository } from "../interFace/handleCanceldoctorApplicationRepoInterFace";


 export default class handleCanceldoctorApplicationRepo implements IhandleCanceldoctorApplicationRepository{
       
        
    handleCanceldoctor___Application = async (data: { email: string; reasons: string[] }) => {
        try {
            console.log('Inside the repo - data:', data);
            
            
            const rejectionMessage = data.reasons.length > 0 
              ? `Your doctor application has been rejected for the following reasons: ${data.reasons.join(', ')}`
              : 'Your doctor application has been rejected.';
            
            // Create a new notification document
            const newNotification = {
              email: data.email,
              message: rejectionMessage,
              type: 'ALERT', // Using ALERT type for rejections
              isRead: false,
              createdAt: new Date(),
              paymentStatus: 'PENDING' // Required field based on schema
            };
            
            // Save the notification to the database
            const savedNotification = await NotificationModel.create(newNotification);
            
            console.log('Notification created successfully:', savedNotification);
            
            
            return savedNotification;
      
          } catch (error) {
            console.error('Error in repository when creating notification:', error);
            throw error;
          }
        }

        
      }

