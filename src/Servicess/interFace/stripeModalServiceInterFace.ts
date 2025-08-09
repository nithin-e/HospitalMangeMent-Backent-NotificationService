import { AppointmentData, StripeSessionResponse } from "../../repositories/interFace/stripeModalInterFace";

export interface IHandlingStripPaymentService {
    Handling_CreateCheckout_Session(appointmentData: { appointmentData: AppointmentData }): Promise<StripeSessionResponse>;
}