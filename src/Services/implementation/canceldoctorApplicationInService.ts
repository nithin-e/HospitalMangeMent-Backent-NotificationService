import {
  ServiceCancelDoctorApplicationInput,
  ServiceCancelDoctorApplicationOutput,
} from "interfaces/types";
import { ICancelDoctorApplicationRepository } from "../../repositories/interFace/ICanceldoctorApplicationRepository";
import { ICancelDoctorApplicationService } from "../interFace/ICanceldoctorApplication";

export default class HandleCanceldoctorApplicationService
  implements ICancelDoctorApplicationService
{
  private _handleCancelDoctorApplicationRepo: ICancelDoctorApplicationRepository;

  constructor(
    handleCancelDoctorApplicationRepo: ICancelDoctorApplicationRepository
  ) {
    this._handleCancelDoctorApplicationRepo = handleCancelDoctorApplicationRepo;
  }

  /**
   * Cancels a doctor application by storing cancellation details.
   *
   * @param data - Input containing doctor email and cancellation reasons
   * @returns Cancellation response with metadata and payment info
   */

  handleCancelDoctorApplication = async (
    data: ServiceCancelDoctorApplicationInput
  ): Promise<ServiceCancelDoctorApplicationOutput> => {
    try {
      if (!data.email || !Array.isArray(data.reasons)) {
        throw new Error("Invalid input: email and reasons array are required");
      }

      const response =
        await this._handleCancelDoctorApplicationRepo.handleCancelDoctorApplication(
          data
        );

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
        updatedAt: response.updatedAt,
      };
    } catch (error) {
      console.error("Error in notification service:", error);
      throw error;
    }
  };
}
