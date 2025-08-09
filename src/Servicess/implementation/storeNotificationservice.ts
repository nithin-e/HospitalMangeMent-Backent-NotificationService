import { IstoreNotificationService } from "../interFace/storeNotificationServiceInterFace";
import StoreNotificationRepository, { 
  NotificationData, 
  RescheduleData, 
  AdminBlockData, 
  NotificationResponse, 
  RescheduleResponse, 
  AdminBlockResponse 
} from "../../repositories/implementation/storeNotificationRepo";
import { IstoreNotificationRepository } from "../../repositories/interFace/storeNotificationRepoInterFace";
import { UserService } from "../../protoConfig/user.client";

export interface WebhookEventData {
  type: string;
  data: {
    object: {
      metadata?: {
        email?: string;
        transactionId?: string;
      };
      [key: string]: any;
    };
  };
}



const StatusCode = {
    OK: 200,
    Created: 201,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    InternalServerError: 500,
  };



export interface WebhookResponse {
  success: boolean;
  message: string;
}

export default class StoreNotificationService implements IstoreNotificationService {
  private StoreNotificationRepo: IstoreNotificationRepository;
  
  constructor(StoreNotificationRepo: IstoreNotificationRepository) {
    this.StoreNotificationRepo = StoreNotificationRepo;
  }




  StoreNotification_Data = async (data: NotificationData): Promise<NotificationResponse> => {
    try {
        const response = await this.StoreNotificationRepo.storingNotification_Datas(data);
        console.log('check this response after storing notification', response);

       
        const updateUserStatus = (): Promise<boolean> => {
            return new Promise((resolve, reject) => {
                UserService.UpdateDoctorStatusAfterAdminApprove(
                    { email: data.email }, 
                    (err: Error | null, grpcResponse: { success: boolean }) => {
                        if (err) {
                            console.error('Error updating user status:', err);
                            reject(err);
                            return;
                        }
                        
                        console.log('Successfully updated doctor:', grpcResponse);
                        resolve(grpcResponse.success);
                    }
                );
            });
        };

        try {
            // Wait for the gRPC call to complete
            const updateResult = await updateUserStatus();
            
            if (!updateResult) {
                throw new Error('Failed to update doctor status');
            }

            console.log('Doctor status updated successfully');
            return response;
            
        } catch (updateError) {
            console.error('Error updating doctor status:', updateError);
            
            throw new Error('Notification created but failed to update user status');
        }

    } catch (error) {
        console.error("Error in notification use case:", error);
        throw error;
    }
}



 async processWebhookEvent(eventType: string, eventData: WebhookEventData): Promise<WebhookResponse> {
  try {
    if (eventType === 'checkout.session.completed') {
      const email = eventData.data.object.metadata?.email;
      const transactionId = eventData.data.object.metadata?.transactionId;
     
      if (!email) {
        return {
          success: false,
          message: 'Email not found in session metadata'
        };
      }
     
      const updated = await this.StoreNotificationRepo.updatePaymentStatus(
        email,
        'COMPLETED',
        transactionId
      );

      // Return a Promise that resolves when UserService call completes
      return new Promise((resolve) => {
        UserService.UpdateDoctorStatusAndUserRole(
          { email: email },
          (err: Error | null, response: boolean) => {
            if (err) {
              console.error('Error updating user status:', err);
              resolve({
                success: false,
                message: 'Payment status updated but failed to update user status'
              });
            } else {
              resolve({
                success: updated && response,
                message: updated
                  ? response 
                    ? 'Payment status and user status updated successfully'
                    : 'Payment updated but user status update failed'
                  : 'No pending payment found for this email'
              });
            }
          }
        );
      });
    }
   
    return {
      success: true,
      message: 'Event acknowledged but no action taken'
    };
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return {
      success: false,
      message: `Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}





  rescheduleAppointment__Notification = async (data: RescheduleData): Promise<RescheduleResponse> => {
    try {
      return await this.StoreNotificationRepo.reschedule_Appointment__Notification(data);
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  }

  creatingNotification_AdminBlock = async (data: AdminBlockData): Promise<AdminBlockResponse> => {
    try {
      return await this.StoreNotificationRepo.creatingNotification__AdminBlock(data);
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  }
}