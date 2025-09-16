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
function convertTypeToProtoEnum(type) {
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
function convertStatusToProtoEnum(status) {
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
function dateToTimestamp(date) {
    const seconds = Math.floor(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    return { seconds, nanos };
}
class StoreNotificationController {
    constructor(storeNotificationService) {
        this.storeNotificationData = (call, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = call.request;
                if (!email) {
                    throw new Error("Email is required");
                }
                const dbResponse = yield this._storeNotificationService.storeNotificationData({ email });
                const { notification } = dbResponse;
                const protoNotification = {
                    id: notification.id.toString(),
                    user_id: notification.email || "",
                    title: "",
                    message: notification.message,
                    type: convertTypeToProtoEnum(notification.type),
                    is_read: notification.isRead,
                    created_at: dateToTimestamp(notification.createdAt),
                    payment_amount: Number(notification.paymentAmount) || 0,
                    payment_link: notification.paymentLink || "",
                    payment_status: convertStatusToProtoEnum(notification.paymentStatus),
                };
                callback(null, { notification: protoNotification });
            }
            catch (error) {
                const grpcError = {
                    code: grpc.status.INTERNAL,
                    message: error.message,
                };
                callback(grpcError, null);
            }
        });
        this.handleStripeWebhook = (eventType) => __awaiter(this, void 0, void 0, function* () {
            try {
                const email = eventType.email;
                const transactionId = eventType.transactionId;
                const result = yield this._storeNotificationService.processWebhookEvent(email, transactionId);
                if (result) {
                    console.log("Notification deleted succesfully for email:", eventType.email);
                }
            }
            catch (error) {
                console.error("error in handlestripewebhook:", error);
                throw error;
            }
        });
        this.rescheduleAppointmentNotification = (call, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, time } = call.request;
                if (!email || !time) {
                    const error = {
                        code: grpc.status.INVALID_ARGUMENT,
                        message: "Email and time are required",
                    };
                    return callback(error, null);
                }
                yield this._storeNotificationService.rescheduleAppointmentNotification({
                    email,
                    time,
                });
                callback(null, { success: true });
            }
            catch (error) {
                const grpcError = {
                    code: grpc.status.INTERNAL,
                    message: error.message,
                };
                callback(grpcError, null);
            }
        });
        this.createAdminBlockNotification = (call, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, reason } = call.request;
                const dbResponse = yield this._storeNotificationService.createAdminBlockNotification({
                    email,
                    reason,
                });
                callback(null, dbResponse);
            }
            catch (error) {
                const grpcError = {
                    code: grpc.status.INTERNAL,
                    message: error.message,
                };
                callback(grpcError, null);
            }
        });
        this._storeNotificationService = storeNotificationService;
    }
}
exports.default = StoreNotificationController;
