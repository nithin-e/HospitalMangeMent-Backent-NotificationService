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
class NotificationController {
    constructor(fetchNotificationService) {
        this._fetchNotificationService = fetchNotificationService;
    }
    fetchNotifications(call, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = call.request;
                console.log("Fetching notifications for email:", email);
                if (!email) {
                    throw new Error("Email is required");
                }
                if (!this._fetchNotificationService) {
                    throw new Error("FecthNotificationService is not initialized");
                }
                const response = yield this._fetchNotificationService.fetchNotifications(email);
                const formattedNotifications = response.notification.map((notification) => {
                    return {
                        id: notification.id,
                        user_id: notification.email,
                        message: notification.message,
                        type: this.getNotificationType(notification.type),
                        is_read: notification.isRead,
                        created_at: this.timestampFromDate(notification.createdAt),
                        payment_amount: notification.paymentAmount || 0,
                        payment_link: notification.paymentLink || "",
                        payment_status: this.getPaymentStatus(notification.paymentStatus),
                    };
                });
                const notificationResponse = {
                    notification: formattedNotifications,
                    success: response.success,
                };
                callback(null, notificationResponse);
                return notificationResponse;
            }
            catch (error) {
                console.log("Error in notification controller:", error);
                const grpcError = {
                    code: grpc.status.INTERNAL,
                    message: error.message,
                };
                callback(grpcError, null);
                throw error;
            }
        });
    }
    getNotificationType(type) {
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
    getPaymentStatus(status) {
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
    timestampFromDate(date) {
        if (!date)
            return null;
        const milliseconds = new Date(date).getTime();
        return {
            seconds: Math.floor(milliseconds / 1000),
            nanos: (milliseconds % 1000) * 1000000,
        };
    }
}
exports.default = NotificationController;
