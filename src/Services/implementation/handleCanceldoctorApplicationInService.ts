import HandleCanceldoctorApplicationRepository, { 
  CancelDoctorApplicationInput, 
  CancelDoctorApplicationOutput 
} from "../../repositories/implementation/handleCanceldoctorApplicationRepo";
import { ICancelDoctorApplicationRepository } from "../../repositories/interFace/handleCanceldoctorApplicationRepoInterFace";
import { ICancelDoctorApplicationService } from "../interFace/handleCanceldoctorApplicationInInterFace";

// Types for service layer
export interface ServiceCancelDoctorApplicationInput {
  email: string;
  reasons: string[];
}

export interface ServiceCancelDoctorApplicationOutput {
  _id: string;
  email: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  paymentStatus: string;
  paymentAmount?: number;
  paymentLink?: string;
  updatedAt?: Date;
}

export default class HandleCanceldoctorApplicationService implements ICancelDoctorApplicationService {
  private handleCanceldoctorApplicationRepo: ICancelDoctorApplicationRepository;
  
  constructor(handleCanceldoctorApplicationRepo: ICancelDoctorApplicationRepository) {
    this.handleCanceldoctorApplicationRepo = handleCanceldoctorApplicationRepo;
  }

  handleCancelDoctorApplication = async (
    data: ServiceCancelDoctorApplicationInput
  ): Promise<ServiceCancelDoctorApplicationOutput> => {
    try {
      // Validate input
      if (!data.email || !Array.isArray(data.reasons)) {
        throw new Error('Invalid input: email and reasons array are required');
      }

      const response = await this.handleCanceldoctorApplicationRepo.handleCancelDoctorApplication(data);
      console.log('Service response:', response);
      
      return {
        _id: response._id,
        email: response.email,
        message: response.message,
        type: response.type,
        isRead: response.isRead,
        createdAt: response.createdAt,
        paymentStatus: response.paymentStatus,
        paymentAmount: response.paymentAmount,
        paymentLink: response.paymentLink,
        updatedAt: response.updatedAt
      };
    } catch (error) {
      console.error("Error in notification service:", error);
      throw error;
    }
  }
}