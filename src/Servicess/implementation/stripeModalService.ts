import { IHandlingStripPaymentService } from "../interFace/stripeModalServiceInterFace";
import { AppointmentData, IHandlingStripPaymentRepository, StripeSessionResponse } from "../../repositories/interFace/stripeModalInterFace";

export default class HandlingStripPaymentServices implements IHandlingStripPaymentService {
    private StripModalRepo: IHandlingStripPaymentRepository;

    constructor(StripModalRepo: IHandlingStripPaymentRepository) {
        this.StripModalRepo = StripModalRepo;
    }

    async Handling_CreateCheckout_Session(appointmentData: { appointmentData: AppointmentData }): Promise<StripeSessionResponse> {
        try {
            console.log('ith ibde ethe avastahhhh')
            return await this.StripModalRepo.HandlingCreateCheckout_Session(appointmentData);
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