import { AppointmentData, StripeSessionResponse } from '@/types/types';

export interface IStripePaymentRepository {
    createCheckoutSession(data: {
        appointmentData: AppointmentData;
    }): Promise<StripeSessionResponse>;
}
