import * as grpc from "@grpc/grpc-js";

import { IStripePaymentService } from "../../Services/interFace/IStripeModalService";
import { GrpcCall, GrpcCallback } from "../../notificationTypes";
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  StripeSessionResponse,
} from "interfaces/types";

export default class StripePaymentController {
  private _stripePaymentService: IStripePaymentService;

  constructor(stripePaymentService: IStripePaymentService) {
    this._stripePaymentService = stripePaymentService;
  }

  /**
   * Creates a Stripe checkout session for appointment payment.
   *
   * @param call - gRPC request with appointment data
   * @param callback - gRPC callback with Stripe session response
   */

  createCheckoutSession = async (
    call: GrpcCall,
    callback: GrpcCallback
  ): Promise<void> => {
    try {
      const request: CreateCheckoutSessionRequest = call.request;

      if (!request.appointmentData) {
        throw new Error("Appointment data is required");
      }

      const response: StripeSessionResponse =
        await this._stripePaymentService.createCheckoutSession(request);

      const grpcResponse: CreateCheckoutSessionResponse = {
        success: response.success,
        session_id: response.sessionId || undefined,
        checkout_url: response.url || undefined,
        error: response.error,
      };

      console.log("controller aaahnu seen lle", grpcResponse);
      callback(null, grpcResponse);
    } catch (error) {
      console.error("Error in stripe payment controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : "Unknown error",
      };

      throw error;
    }
  };
}
