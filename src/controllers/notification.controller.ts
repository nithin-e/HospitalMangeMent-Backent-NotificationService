import * as grpc from '@grpc/grpc-js';
import {
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    GrpcCalls,
    IEventData,
    INotificationsResponse,
    NotificationProtoResponse,
    ServiceCancelDoctorApplicationOutput,
    StoreNotificationResponse,
    StripeSessionResponse,
} from '@/types/types';
import { NotificationMapper } from '../mappers/notification.mapper';
import {
    GrpcCall,
    GrpcCallback,
    IGrpcNotificationResponse,
} from '@/types/notificationTypes';
import { IFetchNotificationService } from '@/services/interfaces/INotification.service';
import { GrpcErrorHandler } from '@/utility/GrpcErrorHandler';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { DoctorApplicationMapper } from '@/mappers/DoctorApplicationMapper';
import { error } from 'console';
import { StoreNotificationMapper } from '@/mappers/StoreNotificationMapper';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types/inversify';
import { Request, Response } from 'express';

@injectable()
export class NotificationController {
    constructor(
        @inject(TYPES.NotificationService)
        private _fetchNotificationService: IFetchNotificationService
    ) {}

    async fetchNotifications(
        call: ServerUnaryCall<Record<string, never>, IGrpcNotificationResponse>,
        callback: sendUnaryData<IGrpcNotificationResponse>
    ): Promise<IGrpcNotificationResponse> {
        try {
            const { email } = call.request;

            if (!email) {
                throw new Error('Email is required');
            }

            const response: INotificationsResponse =
                await this._fetchNotificationService.fetchNotifications(email);

            const notificationResponse =
                NotificationMapper.toGrpcResponse(response);

            callback(null, notificationResponse);
            return notificationResponse;
        } catch (error) {
            console.log('Error in notification controller:', error);
            console.error('Error in notification controller:', error);
            callback(GrpcErrorHandler.internal(error), null);
            throw error;
        }
    }

    handleCancelDoctorApplication = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { email, reasons } = req.body;

            const dbResponse =
                await this._fetchNotificationService.handleCancelDoctorApplication(
                    {
                        email,
                        reasons,
                    }
                );

            const notificationResponse = DoctorApplicationMapper.toGrpcResponse(
                email,
                dbResponse
            );

            res.status(200).json({ notification: notificationResponse });
        } catch (error: any) {
            console.error('Error in handleCancelDoctorApplication:', error);
            res.status(500).json({
                message: error.message || 'Internal server error',
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

            const protoNotification =
                StoreNotificationMapper.toGrpcResponse(notification);

            res.status(200).json({ notification: protoNotification });
        } catch (error: any) {
            console.error('Error storing notification:', error);
            res.status(500).json({
                message: error.message || 'Internal server error',
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
                    'Notification deleted succesfully for email:',
                    eventType.email
                );
            }
        } catch (error) {
            console.error('error in handlestripewebhook:', error);
            throw error;
        }
    };

    rescheduleAppointmentNotification = async (req: Request, res: Response) => {
        try {
            const { email, time } = req.body;

            if (!email || !time) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and time are required',
                });
            }

            await this._fetchNotificationService.rescheduleAppointmentNotification(
                {
                    email,
                    time,
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Reschedule notification sent successfully',
            });
        } catch (error) {
            console.error(
                'Error in rescheduleAppointmentNotificationRest:',
                error
            );
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
        call: GrpcCall,
        callback: GrpcCallback
    ): Promise<void> => {
        try {
            const request: CreateCheckoutSessionRequest = call.request;

            if (!request.appointmentData) {
                throw new Error('Appointment data is required');
            }

            const response: StripeSessionResponse =
                await this._fetchNotificationService.createCheckoutSession(
                    request
                );

            const grpcResponse: CreateCheckoutSessionResponse = {
                success: response.success,
                session_id: response.sessionId || undefined,
                checkout_url: response.url || undefined,
                error: response.error,
            };

            console.log('controller aaahnu seen lle', grpcResponse);
            callback(null, grpcResponse);
        } catch (error) {
            console.error('Error in stripe payment controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message:
                    error instanceof Error ? error.message : 'Unknown error',
            };

            throw error;
        }
    };
}
