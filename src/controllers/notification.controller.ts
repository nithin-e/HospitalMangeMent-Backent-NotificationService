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
import { IFetchNotificationService } from '@/services/interfaces/INotificationService';
import { GrpcErrorHandler } from '@/utility/GrpcErrorHandler';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { DoctorApplicationMapper } from '@/mappers/DoctorApplicationMapper';
import { error } from 'console';
import { StoreNotificationMapper } from '@/mappers/StoreNotificationMapper';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types/inversify';

@injectable()
export class NotificationController {
    constructor(
        @inject(TYPES.NotifiactionService)
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
        call: GrpcCall,
        callback: GrpcCallback
    ): Promise<void> => {
        try {
            if (!call.request.email || !Array.isArray(call.request.reasons)) {
                throw error;
            }

            const { email, reasons } = call.request;

            const dbResponse: ServiceCancelDoctorApplicationOutput =
                await this._fetchNotificationService.handleCancelDoctorApplication(
                    {
                        email,
                        reasons,
                    }
                );

            const notificationProto: NotificationProtoResponse =
                DoctorApplicationMapper.toGrpcResponse(email, dbResponse);

            callback(null, { notification: notificationProto });
        } catch (error) {
            console.error('Error in notification controller:', error);
            throw error;
        }
    };

    storeNotificationData = async (
        call: GrpcCalls,
        callback: GrpcCallback<StoreNotificationResponse>
    ): Promise<void> => {
        try {
            const { email } = call.request;

            if (!email) {
                throw new Error('Email is required');
            }

            const dbResponse =
                await this._fetchNotificationService.storeNotificationData({
                    email,
                });

            const { notification } = dbResponse;

            const protoNotification =
                StoreNotificationMapper.toGrpcResponse(notification);

            callback(null, { notification: protoNotification });
        } catch (error) {
            throw error;
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

    rescheduleAppointmentNotification = async (
        call: GrpcCalls,
        callback: GrpcCallback
    ): Promise<void> => {
        try {
            const { email, time } = call.request;

            if (!email || !time) {
                const error = {
                    code: grpc.status.INVALID_ARGUMENT,
                    message: 'Email and time are required',
                };
                throw error;
            }

            await this._fetchNotificationService.rescheduleAppointmentNotification(
                {
                    email,
                    time,
                }
            );

            callback(null, { success: true });
        } catch (error) {
            throw error;
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
