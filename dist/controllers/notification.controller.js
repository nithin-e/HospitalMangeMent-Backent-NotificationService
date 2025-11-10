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
exports.NotificationController = void 0;
const inversify_1 = require("inversify");
const inversify_2 = require("../types/inversify");
const types_1 = require("../types/types");
const GrpcErrorHandler_1 = require("../utility/GrpcErrorHandler");
const messages_constant_1 = require("../constants/messages.constant");
let NotificationController = class NotificationController {
    constructor(_fetchNotificationService) {
        this._fetchNotificationService = _fetchNotificationService;
        this.handleCancelDoctorApplication = async (req, res) => {
            try {
                const { email, reasons } = req.body;
                const notificationResponse = await this._fetchNotificationService.handleCancelDoctorApplication({
                    email,
                    reasons,
                });
                res.status(types_1.HttpStatusCode.OK).json({
                    notification: notificationResponse,
                });
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.DOCTOR_APPLICATION.CANCEL_FAILED, error);
                res.status(types_1.HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: error instanceof Error
                        ? error.message
                        : messages_constant_1.NOTIFICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
                });
            }
        };
        this.storeNotificationData = async (req, res) => {
            try {
                const { email } = req.body;
                const dbResponse = await this._fetchNotificationService.storeNotificationData({
                    email,
                });
                const { notification } = dbResponse;
                res.status(types_1.HttpStatusCode.OK).json({
                    notification: notification,
                });
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
                res.status(types_1.HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: error instanceof Error
                        ? error.message
                        : messages_constant_1.NOTIFICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
                });
            }
        };
        this.handleStripeWebhook = async (eventType) => {
            try {
                const email = eventType.email;
                const transactionId = eventType.transactionId;
                const result = await this._fetchNotificationService.processWebhookEvent(email, transactionId);
                if (result) {
                    console.log(`${messages_constant_1.NOTIFICATION_MESSAGES.WEBHOOK.NOTIFICATION_DELETED}: ${email}`);
                }
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.WEBHOOK_PROCESSING_FAILED, error);
                throw error;
            }
        };
        this.rescheduleAppointmentNotification = async (req, res) => {
            try {
                const { email, time } = req.body;
                if (!email || !time) {
                    return res.status(types_1.HttpStatusCode.BAD_REQUEST).json({
                        success: false,
                        message: messages_constant_1.NOTIFICATION_MESSAGES.VALIDATION
                            .EMAIL_AND_TIME_REQUIRED,
                    });
                }
                await this._fetchNotificationService.rescheduleAppointmentNotification({
                    email,
                    time,
                });
                return res.status(types_1.HttpStatusCode.OK).json({
                    success: true,
                    message: messages_constant_1.NOTIFICATION_MESSAGES.RESCHEDULE.SUCCESS,
                });
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.RESCHEDULE_FAILED, error);
            }
        };
        this.createAdminBlockNotification = async (call, callback) => {
            try {
                const { email, reason } = call.request;
                const dbResponse = await this._fetchNotificationService.createAdminBlockNotification({
                    email,
                    reason,
                });
                callback(null, dbResponse);
            }
            catch (error) {
                throw error;
            }
        };
        this.createCheckoutSession = async (req, res) => {
            try {
                const { appointmentData } = req.body;
                const response = await this._fetchNotificationService.createCheckoutSession({
                    appointmentData,
                });
                const restResponse = {
                    success: response.success,
                    session_id: response.sessionId || undefined,
                    checkout_url: response.url || undefined,
                    error: response.error,
                };
                res.status(types_1.HttpStatusCode.OK).json(restResponse);
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.STRIPE_PAYMENT_FAILED, error);
                res.status(types_1.HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
    }
    async fetchNotifications(call, callback) {
        try {
            const { email } = call.request;
            if (!email) {
                throw new Error(messages_constant_1.NOTIFICATION_MESSAGES.VALIDATION.EMAIL_REQUIRED);
            }
            const notificationResponse = await this._fetchNotificationService.fetchNotifications(email);
            callback(null, notificationResponse);
            return notificationResponse;
        }
        catch (error) {
            console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.CONTROLLER_ERROR, error);
            callback(GrpcErrorHandler_1.GrpcErrorHandler.internal(error), null);
            throw error;
        }
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(inversify_2.TYPES.NotificationService)),
    __metadata("design:paramtypes", [Object])
], NotificationController);
