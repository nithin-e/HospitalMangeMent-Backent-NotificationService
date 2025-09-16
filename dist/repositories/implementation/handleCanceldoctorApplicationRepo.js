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
class CancelDoctorApplicationRepository {
    constructor() {
        this.handleCancelDoctorApplication = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Inside the repo - data:', data);
                const rejectionMessage = data.reasons.length > 0
                    ? `Your doctor application has been rejected for the following reasons: ${data.reasons.join(', ')}`
                    : 'Your doctor application has been rejected.';
                // Create a new notification document
                const newNotification = {
                    email: data.email,
                    message: rejectionMessage,
                    type: 'ALERT',
                    isRead: false,
                    createdAt: new Date(),
                    paymentStatus: 'PENDING'
                };
                // Save the notification to the database
                const savedNotification = yield notification_Schema_1.NotificationModel.create(newNotification);
                console.log('Notification created successfully:', savedNotification);
                return savedNotification.toObject();
            }
            catch (error) {
                console.error('Error in repository when creating notification:', error);
                throw error;
            }
        });
    }
}
exports.default = CancelDoctorApplicationRepository;
