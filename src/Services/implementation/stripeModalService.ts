import {  IStripePaymentService } from "../interFace/stripeModalServiceInterFace";
import { AppointmentData, IStripePaymentRepository, StripeSessionResponse } from "../../repositories/interFace/stripeModalInterFace";

export default class StripePaymentService  implements IStripePaymentService {
    private StripModalRepo: IStripePaymentRepository;

    constructor(StripModalRepo: IStripePaymentRepository) {
        this.StripModalRepo = StripModalRepo;
    }

    async createCheckoutSession(appointmentData: { appointmentData: AppointmentData }): Promise<StripeSessionResponse> {
        try {
            console.log('ith ibde ethe avastahhhh')
            return await this.StripModalRepo.createCheckoutSession(appointmentData);
        } catch (error) {
            console.log('Error in stripe payment service:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                sessionId: null,
                url: null
            };
        }
    }
}