import { IStripePaymentService } from "../interFace/stripeModalServiceInterFace";
import {
  AppointmentData,
  IStripePaymentRepository,
  StripeSessionResponse,
} from "../../repositories/interFace/stripeModalInterFace";

export default class StripePaymentService implements IStripePaymentService {
  private _stripeModalRepo: IStripePaymentRepository;

  constructor(stripeModalRepo: IStripePaymentRepository) {
    this._stripeModalRepo = stripeModalRepo;
  }

  async createCheckoutSession(appointmentData: {
    appointmentData: AppointmentData;
  }): Promise<StripeSessionResponse> {
    try {
      return await this._stripeModalRepo.createCheckoutSession(appointmentData);
    } catch (error) {
      console.log("Error in stripe payment service:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        sessionId: null,
        url: null,
      };
    }
  }
}
