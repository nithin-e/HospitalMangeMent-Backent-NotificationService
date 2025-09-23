import { AppointmentData, StripeSessionResponse } from "interfaces/types";

export interface IStripePaymentService {
  createCheckoutSession(data: {
    appointmentData: AppointmentData;
  }): Promise<StripeSessionResponse>;
}
