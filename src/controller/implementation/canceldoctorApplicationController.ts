import { GrpcErrorHandler } from "utility/GrpcErrorHandler";
import { ICancelDoctorApplicationService } from "../../Services/interFace/ICanceldoctorApplication";
import {
  GrpcCall,
  GrpcCallback,
  NotificationProtoResponse,
  ServiceCancelDoctorApplicationOutput,
} from "interfaces/types";
import { DoctorApplicationMapper } from "mappers/DoctorApplicationMapper";

export default class HandleCancelDoctorApplicationController {
  private _handleCancelDoctorApplicationService: ICancelDoctorApplicationService;

  constructor(
    handleCancelDoctorApplicationService: ICancelDoctorApplicationService
  ) {
    this._handleCancelDoctorApplicationService =
      handleCancelDoctorApplicationService;
  }

  /**
   * Cancels a doctor application request.
   *
   * @param call - gRPC request with email and reasons
   * @param callback - gRPC callback for success or error
   */

  handleCancelDoctorApplication = async (
    call: GrpcCall,
    callback: GrpcCallback
  ): Promise<void> => {
    try {
      if (!call.request.email || !Array.isArray(call.request.reasons)) {
        callback(
          GrpcErrorHandler.invalidArgument(
            "Invalid request: email and reasons array are required"
          ),
          undefined
        );
        return;
      }

      const { email, reasons } = call.request;

      const dbResponse: ServiceCancelDoctorApplicationOutput =
        await this._handleCancelDoctorApplicationService.handleCancelDoctorApplication(
          { email, reasons }
        );

      const notificationProto: NotificationProtoResponse =
        DoctorApplicationMapper.toGrpcResponse(email, dbResponse);

      callback(null, { notification: notificationProto });
    } catch (error) {
      console.error("Error in notification controller:", error);
      callback(GrpcErrorHandler.internal(error), undefined);
    }
  };
}
