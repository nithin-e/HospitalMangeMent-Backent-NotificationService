"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const grpc = __importStar(require("@grpc/grpc-js"));
class HandleCancelDoctorApplicationController {
    constructor(handleCancelDoctorApplicationService) {
        this.handleCancelDoctorApplication = (call, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Notification controller request:", call.request);
                if (!call.request.email || !Array.isArray(call.request.reasons)) {
                    const grpcError = {
                        code: grpc.status.INVALID_ARGUMENT,
                        message: "Invalid request: email and reasons array are required",
                    };
                    callback(grpcError, undefined);
                    return;
                }
                const { email, reasons } = call.request;
                const dbResponse = yield this._handleCancelDoctorApplicationService.handleCancelDoctorApplication({
                    email,
                    reasons,
                });
                console.log("Notification created in controller:", dbResponse);
                const notificationProto = {
                    user_id: email,
                    title: "Application Rejected",
                    message: dbResponse.message,
                    type: this.mapNotificationType(dbResponse.type),
                    is_read: dbResponse.isRead,
                    created_at: this.dateToTimestamp(dbResponse.createdAt),
                    payment_amount: dbResponse.paymentAmount || 0,
                    payment_link: dbResponse.paymentLink || "",
                    payment_status: this.mapPaymentStatus(dbResponse.paymentStatus),
                };
                callback(null, { notification: notificationProto });
            }
            catch (error) {
                console.error("Error in notification controller:", error);
                const grpcError = {
                    code: grpc.status.INTERNAL,
                    message: error.message,
                };
                callback(grpcError, undefined);
            }
        });
        this._handleCancelDoctorApplicationService =
            handleCancelDoctorApplicationService;
    }
    mapNotificationType(type) {
        switch (type) {
            case "INFO":
                return 1;
            case "APPROVAL":
                return 2;
            case "PAYMENT":
                return 3;
            case "ALERT":
                return 4;
            default:
                return 0;
        }
    }
    mapPaymentStatus(status) {
        switch (status) {
            case "PENDING":
                return 1;
            case "COMPLETED":
                return 2;
            case "FAILED":
                return 3;
            default:
                return 0;
        }
    }
    dateToTimestamp(date) {
        const timestamp = new Date(date).getTime();
        const seconds = Math.floor(timestamp / 1000);
        const nanos = (timestamp % 1000) * 1000000;
        return { seconds, nanos };
    }
}
exports.default = HandleCancelDoctorApplicationController;
