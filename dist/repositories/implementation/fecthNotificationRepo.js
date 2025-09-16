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
const notification_Schema_1 = require("../../entities/notification_Schema");
class FetchNotificationRepo {
    fetchNotifications(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notifications = yield notification_Schema_1.NotificationModel.findOne({ email });
                if (!notifications) {
                    return {
                        success: false,
                        notification: []
                    };
                }
                const notificationData = {
                    id: notifications._id,
                    email: notifications.email,
                    message: notifications.message,
                    type: notifications.type,
                    paymentAmount: notifications.paymentAmount,
                    paymentLink: notifications.paymentLink,
                    paymentStatus: notifications.paymentStatus,
                    isRead: notifications.isRead,
                    createdAt: notifications.createdAt,
                    updatedAt: notifications.updatedAt
                };
                return {
                    success: true,
                    notification: [notificationData]
                };
            }
            catch (error) {
                console.error('Error in repository:', error);
                throw error;
            }
        });
    }
}
exports.default = FetchNotificationRepo;
