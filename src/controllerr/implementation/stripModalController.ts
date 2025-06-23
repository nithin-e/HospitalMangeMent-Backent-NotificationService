import stripeModalService from "../../Servicess/implementation/stripeModalService";
import * as grpc from '@grpc/grpc-js';
import { IHandlingStripPaymentController } from "../interFace/stripModalControllerInterFace";



 export default class HandlingStripPaymentController implements IHandlingStripPaymentController{
    private StripeModalService:stripeModalService
    constructor(StripeModalService:stripeModalService) {
        this.StripeModalService=StripeModalService
    }


    HandlingCreateCheckoutSession = async (call: any, callback: any) => {
        try {
            console.log('hey check the appointment data', call.request);
            
            // Pass the appointment data to the service
            const response = await this.StripeModalService.Handling_CreateCheckout_Session(call.request);
            
            callback(null, {
                success: response.success,
                session_id: response.sessionId,
                checkout_url: response.url,
            });
            
        } catch (error) {
            console.log('Error in notification controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            callback(grpcError, null);
        }
    }


}


