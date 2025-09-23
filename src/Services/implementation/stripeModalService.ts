import { IStripePaymentService } from "../interFace/IStripeModalService";
import { IStripePaymentRepository } from "../../repositories/interFace/IStripeModalRepository";
import { AppointmentData, StripeSessionResponse } from "interfaces/types";

export default class StripePaymentService implements IStripePaymentService {
  private _stripeModalRepo: IStripePaymentRepository;

  constructor(stripeModalRepo: IStripePaymentRepository) {
    this._stripeModalRepo = stripeModalRepo;
  }

  /**
   * Creates a Stripe checkout session for an appointment.
   *
   * @param appointmentData - Appointment details
   * @returns Stripe checkout session response
   */

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
