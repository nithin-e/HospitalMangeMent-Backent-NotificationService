import { UserService } from '../../protoConfig/user.client';
import { TYPES } from '../../types/inversify';
import {
    INotificationsResponse,
    ServiceCancelDoctorApplicationInput,
    NotificationData,
    NotificationServiceResponse,
    WebhookResponse,
    RescheduleData,
    RescheduleResponse,
    AdminBlockData,
    AdminBlockResponse,
    AppointmentData,
    StripeSessionResponse,
    TimestampProto,
    NotificationProtoResponse,
} from '../../types/types';
import { inject, injectable } from 'inversify';
import { INotificationService } from '../interfaces/INotification.service';
import { INotificationRepository } from '@/repositories/interFace/INotification.repository';
import { IGrpcNotificationResponse } from '@/types/notificationTypes';
import { NotificationMapper } from '../../mappers/notification.mapper';
import { StoreNotificationMapper } from '../../mappers/StoreNotificationMapper';
import { NOTIFICATION_MESSAGES } from '../../constants/messages.constant';


@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject(TYPES.NotificationRepository)
        private _fetchNotificationRepository: INotificationRepository
    ) {}

    async fetchNotifications(
        email: string
    ): Promise<IGrpcNotificationResponse> {
        try {
            if (!email) {
                throw new Error(
                    NOTIFICATION_MESSAGES.VALIDATION.EMAIL_REQUIRED
                );
            }

            const response: INotificationsResponse =
                await this._fetchNotificationRepository.fetchNotifications(
                    email
                );

            const grpcResponse: IGrpcNotificationResponse =
                NotificationMapper.toGrpcResponse(response);

            return grpcResponse;
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.FETCH_FAILED, error);
            throw error;
        }
    }

    handleCancelDoctorApplication = async (
        data: ServiceCancelDoctorApplicationInput
    ): Promise<NotificationProtoResponse> => {
        try {
            if (!data.email || !Array.isArray(data.reasons)) {
                throw new Error(
                    NOTIFICATION_MESSAGES.VALIDATION.EMAIL_AND_REASONS_REQUIRED
                );
            }

            const response =
                await this._fetchNotificationRepository.handleCancelDoctorApplication(
                    data
                );

            const protoResponse: NotificationProtoResponse = {
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
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR,
                error
            );
            throw error;
        }
    };

    storeNotificationData = async (
        data: NotificationData
    ): Promise<NotificationServiceResponse> => {
        try {
            const response =
                await this._fetchNotificationRepository.storeNotificationData(
                    data
                );

            const updateUserStatus = (): Promise<boolean> => {
                return new Promise((resolve, reject) => {
                    UserService.UpdateDoctorStatusAfterAdminApprove(
                        { email: data.email },
                        (
                            err: Error | null,
                            grpcResponse: { success: boolean }
                        ) => {
                            if (err) {
                                console.error(
                                    NOTIFICATION_MESSAGES.ERROR
                                        .UPDATE_USER_STATUS_FAILED,
                                    err
                                );
                                reject(err);
                                return;
                            }

                            resolve(grpcResponse.success);
                        }
                    );
                });
            };

            try {
                const updateResult = await updateUserStatus();

                if (!updateResult) {
                    throw new Error(
                        NOTIFICATION_MESSAGES.DOCTOR_APPLICATION.STATUS_UPDATE_FAILED
                    );
                }

                const protoNotification =
                    StoreNotificationMapper.toGrpcResponse(
                        response.notification
                    );

                return {
                    notification: protoNotification,
                };
            } catch (updateError) {
                console.error(
                    NOTIFICATION_MESSAGES.ERROR.UPDATE_USER_STATUS_FAILED,
                    updateError
                );

                throw new Error(
                    NOTIFICATION_MESSAGES.DOCTOR_APPLICATION.NOTIFICATION_CREATED_STATUS_FAILED
                );
            }
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR,
                error
            );
            throw error;
        }
    };

    async processWebhookEvent(
        email: string,
        transactionId: string
    ): Promise<WebhookResponse> {
        try {
            if (!email) {
                return {
                    success: false,
                    message: NOTIFICATION_MESSAGES.WEBHOOK.EMAIL_NOT_FOUND,
                };
            }

            const updated =
                await this._fetchNotificationRepository.updatePaymentStatus(
                    email,
                    'COMPLETED',
                    transactionId
                );

            return {
                success: true,
                message: NOTIFICATION_MESSAGES.WEBHOOK.ACKNOWLEDGED,
            };
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.WEBHOOK_PROCESSING_FAILED,
                error
            );
            return {
                success: false,
                message: `${NOTIFICATION_MESSAGES.ERROR.WEBHOOK_PROCESSING_FAILED}: ${
                    error instanceof Error
                        ? error.message
                        : NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR
                }`,
            };
        }
    }

    rescheduleAppointmentNotification = async (
        data: RescheduleData
    ): Promise<RescheduleResponse> => {
        try {
            return await this._fetchNotificationRepository.rescheduleAppointmentNotification(
                data
            );
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR,
                error
            );
            throw error;
        }
    };

    createAdminBlockNotification = async (
        data: AdminBlockData
    ): Promise<AdminBlockResponse> => {
        try {
            return await this._fetchNotificationRepository.createAdminBlockNotification(
                data
            );
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.SERVICE_LAYER_ERROR,
                error
            );
            throw error;
        }
    };

    async createCheckoutSession(appointmentData: {
        appointmentData: AppointmentData;
    }): Promise<StripeSessionResponse> {
        try {
            return await this._fetchNotificationRepository.createCheckoutSession(
                appointmentData
            );
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.STRIPE_PAYMENT_FAILED,
                error
            );
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR,
                sessionId: null,
                url: null,
            };
        }
    }

    private mapNotificationType(type: string): number {
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

    private mapPaymentStatus(status: string): number {
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

    private dateToTimestamp(date: Date): TimestampProto {
        const timestamp = new Date(date).getTime();
        const seconds = Math.floor(timestamp / 1000);
        const nanos = (timestamp % 1000) * 1000000;

        return { seconds, nanos };
    }
}
