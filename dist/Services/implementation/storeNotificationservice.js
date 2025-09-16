"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_client_1 = require("../../protoConfig/user.client");
class StoreNotificationService {
    constructor(storeNotificationRepo) {
        this.storeNotificationData = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._storeNotificationRepo.storeNotificationData(data);
                console.log("check this response after storing notification", response);
                const updateUserStatus = () => {
                    return new Promise((resolve, reject) => {
                        user_client_1.UserService.UpdateDoctorStatusAfterAdminApprove({ email: data.email }, (err, grpcResponse) => {
                            if (err) {
                                console.error("Error updating user status:", err);
                                reject(err);
                                return;
                            }
                            console.log("Successfully updated doctor:", grpcResponse);
                            resolve(grpcResponse.success);
                        });
                    });
                };
                try {
                    const updateResult = yield updateUserStatus();
                    if (!updateResult) {
                        throw new Error("Failed to update doctor status");
                    }
                    console.log("Doctor status updated successfully");
                    return response;
                }
                catch (updateError) {
                    console.error("Error updating doctor status:", updateError);
                    throw new Error("Notification created but failed to update user status");
                }
            }
            catch (error) {
                console.error("Error in notification use case:", error);
                throw error;
            }
        });
        this.rescheduleAppointmentNotification = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._storeNotificationRepo.rescheduleAppointmentNotification(data);
            }
            catch (error) {
                console.error("Error in notification use case:", error);
                throw error;
            }
        });
        this.createAdminBlockNotification = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._storeNotificationRepo.createAdminBlockNotification(data);
            }
            catch (error) {
                console.error("Error in notification use case:", error);
                throw error;
            }
        });
        this._storeNotificationRepo = storeNotificationRepo;
    }
    // after the payment changing the user role
    processWebhookEvent(email, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!email) {
                    return {
                        success: false,
                        message: "Email not found in session metadata",
                    };
                }
                const updated = yield this._storeNotificationRepo.updatePaymentStatus(email, "COMPLETED", transactionId);
                return {
                    success: true,
                    message: "Event acknowledged but no action taken",
                };
            }
            catch (error) {
                console.error("Error processing webhook event:", error);
                return {
                    success: false,
                    message: `Error processing webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
                };
            }
        });
    }
}
exports.default = StoreNotificationService;
