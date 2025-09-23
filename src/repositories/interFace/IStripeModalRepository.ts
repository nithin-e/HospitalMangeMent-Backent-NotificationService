import { AppointmentData, StripeSessionResponse } from "interfaces/types";

export interface IStripePaymentRepository {
  createCheckoutSession(data: {
    appointmentData: AppointmentData;
  }): Promise<StripeSessionResponse>;
}
