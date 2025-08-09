import { NotificationModel, INotification } from "../../entities/notification_Schema";
import { IhandleCanceldoctorApplicationRepository } from "../interFace/handleCanceldoctorApplicationRepoInterFace";

// Types for repository layer
export interface CancelDoctorApplicationInput {
  email: string;
  reasons: string[];
}

export interface CancelDoctorApplicationOutput extends INotification {
  _id: string;
}

export default class HandleCanceldoctorApplicationRepo implements IhandleCanceldoctorApplicationRepository {
  
  handleCanceldoctorApplication = async (
    data: CancelDoctorApplicationInput
  ): Promise<CancelDoctorApplicationOutput> => {
    try {
      console.log('Inside the repo - data:', data);
      
      const rejectionMessage = data.reasons.length > 0 
        ? `Your doctor application has been rejected for the following reasons: ${data.reasons.join(', ')}`
        : 'Your doctor application has been rejected.';
      
      // Create a new notification document
      const newNotification = {
        email: data.email,
        message: rejectionMessage,
        type: 'ALERT' as const,
        isRead: false,
        createdAt: new Date(),
        paymentStatus: 'PENDING' as const
      };
      
      // Save the notification to the database
      const savedNotification = await NotificationModel.create(newNotification);
      
      console.log('Notification created successfully:', savedNotification);
      
      return savedNotification.toObject() as CancelDoctorApplicationOutput;

    } catch (error) {
      console.error('Error in repository when creating notification:', error);
      throw error;
    }
  }
}