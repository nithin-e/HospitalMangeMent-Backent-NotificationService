import { AppointmentData, StripeSessionResponse } from '@/types/types';

export interface IStripePaymentService {
    createCheckoutSession(data: {
        appointmentData: AppointmentData;
    }): Promise<StripeSessionResponse>;
}
