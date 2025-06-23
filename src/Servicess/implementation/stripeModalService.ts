import stripModalRepo from "../../repositories/implementation/stripModalRepo";
import { IHandlingStripPaymentService } from "../interFace/stripeModalServiceInterFace";
import * as grpc from '@grpc/grpc-js';



export default class HandlingStripPaymentServices implements IHandlingStripPaymentService {
    private StripModalRepo:stripModalRepo
    constructor(StripModalRepo:stripModalRepo) {
        this.StripModalRepo=StripModalRepo
    }

    Handling_CreateCheckout_Session = async (appointmentData: any) => {
        try {
            // Pass appointment data to repository
            const response = await this.StripModalRepo.HandlingCreateCheckout_Session(appointmentData);
            return response;
            
        } catch (error) {
            console.log('Error in notification service:', error);
            
            return {
                success: false,
                error: (error as Error).message,
                sessionId: null,
                url: null
            };
        }
    }

}