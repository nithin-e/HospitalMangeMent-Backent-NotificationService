import * as grpc from '@grpc/grpc-js';

import { AppointmentData, StripeSessionResponse } from "../../repositories/interFace/stripeModalInterFace";
import { IHandlingStripPaymentService } from '../../Servicess/interFace/stripeModalServiceInterFace';
import { GrpcCall, GrpcCallback } from '../../notificationTypes';

interface CreateCheckoutSessionRequest {
    appointmentData: AppointmentData;
}

interface CreateCheckoutSessionResponse {
    success: boolean;
    session_id?: string;
    checkout_url?: string;
    error?: string;
}


export default class HandlingStripPaymentController  {
    private stripePaymentService: IHandlingStripPaymentService;

    constructor(stripePaymentService: IHandlingStripPaymentService) {
        this.stripePaymentService = stripePaymentService;
    }

     Handling_CreateCheckout_Session= async(call: GrpcCall, callback: GrpcCallback): Promise<void>=> {
        try {
            const request: CreateCheckoutSessionRequest = call.request;
            
            if (!request.appointmentData) {
                throw new Error('Appointment data is required');
            }

            const response: StripeSessionResponse = await this.stripePaymentService.Handling_CreateCheckout_Session(request);

            const grpcResponse: CreateCheckoutSessionResponse = {
                success: response.success,
                session_id: response.sessionId || undefined,
                checkout_url: response.url || undefined,
                error: response.error
            };

            console.log('controller aaahnu seen lle',grpcResponse)
            callback(null, grpcResponse);
        } catch (error) {
            console.error('Error in stripe payment controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
            //  callback(grpcError);
        }
    }
}