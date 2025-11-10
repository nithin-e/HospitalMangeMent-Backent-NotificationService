import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../types/inversify';
import {
    IGrpcNotificationResponse,
    GrpcCallback,
} from '../types/notificationTypes';
import {
    IEventData,
    GrpcCalls,
    StripeSessionResponse,
    CreateCheckoutSessionResponse,
    HttpStatusCode,
} from '../types/types';
import { GrpcErrorHandler } from '../utility/GrpcErrorHandler';
import { INotificationService } from '@/services/interfaces/INotification.service';
import { NOTIFICATION_MESSAGES } from '../constants/messages.constant';

@injectable()
export class NotificationController {
    constructor(
        @inject(TYPES.NotificationService)
        private _fetchNotificationService: INotificationService
    ) {}

    async fetchNotifications(
        call: ServerUnaryCall<Record<string, never>, IGrpcNotificationResponse>,
        callback: sendUnaryData<IGrpcNotificationResponse>
    ): Promise<IGrpcNotificationResponse> {
        try {
            const { email } = call.request;

            if (!email) {
                throw new Error(
                    NOTIFICATION_MESSAGES.VALIDATION.EMAIL_REQUIRED
                );
            }

            const notificationResponse: IGrpcNotificationResponse =
                await this._fetchNotificationService.fetchNotifications(email);

            callback(null, notificationResponse);
            return notificationResponse;
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.CONTROLLER_ERROR, error);
            callback(GrpcErrorHandler.internal(error), null);
            throw error;
        }
    }
    handleCancelDoctorApplication = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { email, rejectionReasonTexts } = req.body;

            const notificationResponse =
                await this._fetchNotificationService.handleCancelDoctorApplication(
                    {
                        email,
                        reasons: rejectionReasonTexts,
                    }
                );

            res.status(HttpStatusCode.OK).json({
                notification: notificationResponse,
            });
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.DOCTOR_APPLICATION.CANCEL_FAILED,
                error
            );
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : NOTIFICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    storeNotificationData = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { email } = req.body;

            const dbResponse =
                await this._fetchNotificationService.storeNotificationData({
                    email,
                });

            const { notification } = dbResponse;

            res.status(HttpStatusCode.OK).json({
                notification: notification,
            });
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : NOTIFICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    handleStripeWebhook = async (eventType: IEventData): Promise<void> => {
        try {
            const email = eventType.email;
            const transactionId = eventType.transactionId;
            const result =
                await this._fetchNotificationService.processWebhookEvent(
                    email,
                    transactionId
                );

            if (result) {
                console.log(
                    `${NOTIFICATION_MESSAGES.WEBHOOK.NOTIFICATION_DELETED}: ${email}`
                );
            }
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.WEBHOOK_PROCESSING_FAILED,
                error
            );
            throw error;
        }
    };

    rescheduleAppointmentNotification = async (req: Request, res: Response) => {
        try {
            const { email, time } = req.body;

            if (!email || !time) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message:
                        NOTIFICATION_MESSAGES.VALIDATION
                            .EMAIL_AND_TIME_REQUIRED,
                });
            }

            await this._fetchNotificationService.rescheduleAppointmentNotification(
                {
                    email,
                    time,
                }
            );

            return res.status(HttpStatusCode.OK).json({
                success: true,
                message: NOTIFICATION_MESSAGES.RESCHEDULE.SUCCESS,
            });
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.RESCHEDULE_FAILED, error);
        }
    };

    createAdminBlockNotification = async (
        call: GrpcCalls,
        callback: GrpcCallback
    ): Promise<void> => {
        try {
            const { email, reason } = call.request;

            const dbResponse =
                await this._fetchNotificationService.createAdminBlockNotification(
                    {
                        email,
                        reason,
                    }
                );

            callback(null, dbResponse);
        } catch (error) {
            throw error;
        }
    };

    createCheckoutSession = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { appointmentData } = req.body;

            const response: StripeSessionResponse =
                await this._fetchNotificationService.createCheckoutSession({
                    appointmentData,
                });

            const restResponse: CreateCheckoutSessionResponse = {
                success: response.success,
                session_id: response.sessionId || undefined,
                checkout_url: response.url || undefined,
                error: response.error,
            };

            res.status(HttpStatusCode.OK).json(restResponse);
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.STRIPE_PAYMENT_FAILED,
                error
            );
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}
