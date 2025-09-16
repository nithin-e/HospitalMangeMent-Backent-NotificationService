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
class HandleCanceldoctorApplicationService {
    constructor(handleCancelDoctorApplicationRepo) {
        this.handleCancelDoctorApplication = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data.email || !Array.isArray(data.reasons)) {
                    throw new Error("Invalid input: email and reasons array are required");
                }
                const response = yield this._handleCancelDoctorApplicationRepo.handleCancelDoctorApplication(data);
                console.log("Service response:", response);
                return {
                    _id: response._id,
                    email: response.email,
                    message: response.message,
                    type: response.type,
                    isRead: response.isRead,
                    createdAt: response.createdAt,
                    paymentStatus: response.paymentStatus,
                    paymentAmount: response.paymentAmount,
                    paymentLink: response.paymentLink,
                    updatedAt: response.updatedAt,
                };
            }
            catch (error) {
                console.error("Error in notification service:", error);
                throw error;
            }
        });
        this._handleCancelDoctorApplicationRepo = handleCancelDoctorApplicationRepo;
    }
}
exports.default = HandleCanceldoctorApplicationService;
