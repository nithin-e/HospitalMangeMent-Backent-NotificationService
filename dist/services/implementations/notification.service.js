"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const user_client_1 = require("../../protoConfig/user.client");
const inversify_1 = require("../../types/inversify");
const inversify_2 = require("inversify");
const notification_mapper_1 = require("../../mappers/notification.mapper");
const StoreNotificationMapper_1 = require("../../mappers/StoreNotificationMapper");
const messages_constant_1 = require("../../constants/messages.constant");
let NotificationService = class NotificationService {
    constructor(_fetchNotificationRepository) {
        this._fetchNotificationRepository = _fetchNotificationRepository;
        this.handleCancelDoctorApplication = async (data) => {
            try {
                if (!data.email || !Array.isArray(data.reasons)) {
                    throw new Error(messages_constant_1.NOTIFICATION_MESSAGES.VALIDATION.EMAIL_AND_REASONS_REQUIRED);
                }
                const response = await this._fetchNotificationRepository.handleCancelDoctorApplication(data);
                const protoResponse = {
                    user_id: data.email,
                    title: 'Application Rejected',
                    message: response.message,
                    type: this.mapNotificationType(response.type),
                    is_read: response.isRead,
                    created_at: this.dateToTimestamp(response.createdAt),
                    payment_amount: response.paymentAmount || 0,
                    payment_link: response.paymentLink || '',
                    payment_status: this.mapPaymentStatus(response.paymentStatus),
                };
                return protoResponse;
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
                throw error;
            }
        };
        this.storeNotificationData = async (data) => {
            try {
                const response = await this._fetchNotificationRepository.storeNotificationData(data);
                const updateUserStatus = () => {
                    return new Promise((resolve, reject) => {
                        user_client_1.UserService.UpdateDoctorStatusAfterAdminApprove({ email: data.email }, (err, grpcResponse) => {
                            if (err) {
                                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR
                                    .UPDATE_USER_STATUS_FAILED, err);
                                reject(err);
                                return;
                            }
                            resolve(grpcResponse.success);
                        });
                    });
                };
                try {
                    const updateResult = await updateUserStatus();
                    if (!updateResult) {
                        throw new Error(messages_constant_1.NOTIFICATION_MESSAGES.DOCTOR_APPLICATION.STATUS_UPDATE_FAILED);
                    }
                    const protoNotification = StoreNotificationMapper_1.StoreNotificationMapper.toGrpcResponse(response.notification);
                    return {
                        notification: protoNotification,
                    };
                }
                catch (updateError) {
                    console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.UPDATE_USER_STATUS_FAILED, updateError);
                    throw new Error(messages_constant_1.NOTIFICATION_MESSAGES.DOCTOR_APPLICATION.NOTIFICATION_CREATED_STATUS_FAILED);
                }
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
                throw error;
            }
        };
        this.rescheduleAppointmentNotification = async (data) => {
            try {
                return await this._fetchNotificationRepository.rescheduleAppointmentNotification(data);
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
                throw error;
            }
        };
        this.createAdminBlockNotification = async (data) => {
            try {
                return await this._fetchNotificationRepository.createAdminBlockNotification(data);
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);
                throw error;
            }
        };
    }
    async fetchNotifications(email) {
        try {
            if (!email) {
                throw new Error(messages_constant_1.NOTIFICATION_MESSAGES.VALIDATION.EMAIL_REQUIRED);
            }
            const response = await this._fetchNotificationRepository.fetchNotifications(email);
            const grpcResponse = notification_mapper_1.NotificationMapper.toGrpcResponse(response);
            return grpcResponse;
        }
        catch (error) {
            console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.FETCH_FAILED, error);
            throw error;
        }
    }
    async processWebhookEvent(email, transactionId) {
        try {
            if (!email) {
                return {
                    success: false,
                    message: messages_constant_1.NOTIFICATION_MESSAGES.WEBHOOK.EMAIL_NOT_FOUND,
                };
            }
            const updated = await this._fetchNotificationRepository.updatePaymentStatus(email, 'COMPLETED', transactionId);
            return {
                success: true,
                message: messages_constant_1.NOTIFICATION_MESSAGES.WEBHOOK.ACKNOWLEDGED,
            };
        }
        catch (error) {
            console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.WEBHOOK_PROCESSING_FAILED, error);
            return {
                success: false,
                message: `${messages_constant_1.NOTIFICATION_MESSAGES.ERROR.WEBHOOK_PROCESSING_FAILED}: ${error instanceof Error
                    ? error.message
                    : messages_constant_1.NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR}`,
            };
        }
    }
    async createCheckoutSession(appointmentData) {
        try {
            return await this._fetchNotificationRepository.createCheckoutSession(appointmentData);
        }
        catch (error) {
            console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.STRIPE_PAYMENT_FAILED, error);
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : messages_constant_1.NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR,
                sessionId: null,
                url: null,
            };
        }
    }
    mapNotificationType(type) {
        switch (type) {
            case 'INFO':
                return 1;
            case 'APPROVAL':
                return 2;
            case 'PAYMENT':
                return 3;
            case 'ALERT':
                return 4;
            default:
                return 0;
        }
    }
    mapPaymentStatus(status) {
        switch (status) {
            case 'PENDING':
                return 1;
            case 'COMPLETED':
                return 2;
            case 'FAILED':
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, inversify_2.injectable)(),
    __param(0, (0, inversify_2.inject)(inversify_1.TYPES.NotificationRepository)),
    __metadata("design:paramtypes", [Object])
], NotificationService);
