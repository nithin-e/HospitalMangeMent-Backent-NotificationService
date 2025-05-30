
import { IhandleCanceldoctorApplicationService } from "../interFace/handleCanceldoctorApplicationInInterFace";
import HandleCanceldoctorApplicationRepository from "../../repositories/implementation/handleCanceldoctorApplicationRepo";



export default class handleCanceldoctorApplicationService implements IhandleCanceldoctorApplicationService{
  private HandleCanceldoctorApplicationRepo: HandleCanceldoctorApplicationRepository;
  
  constructor(HandleCanceldoctorApplicationRepo: HandleCanceldoctorApplicationRepository) {
    this.HandleCanceldoctorApplicationRepo = HandleCanceldoctorApplicationRepo;
  }

  handleCancel_doctor_Application = async (data: {
    email: string;
    reasons: string[];
  }) => {
    try {
      const response = await this.HandleCanceldoctorApplicationRepo.handleCanceldoctor___Application(data);
      console.log('usecase responce',response);
      
      return response;
    } catch (error) {
      console.error("Error in notification use case:", error);
      throw error;
    }
  }
}