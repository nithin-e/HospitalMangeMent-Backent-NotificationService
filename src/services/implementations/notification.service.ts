import {
    AdminBlockData,
    AdminBlockResponse,
    AppointmentData,
    INotificationsResponse,
    NotificationData,
    NotificationServiceResponse,
    RescheduleData,
    RescheduleResponse,
    ServiceCancelDoctorApplicationInput,
    ServiceCancelDoctorApplicationOutput,
    StripeSessionResponse,
    WebhookResponse,
} from '@/types/types';
import { IFetchNotificationRepository } from '../../repositories/interFace/INotification.repository';
import { IFetchNotificationService } from '../interfaces/INotification.service';
import { UserService } from '@/protoConfig/user.client';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types/inversify';

@injectable()
export class NotificationService implements IFetchNotificationService {
    constructor(
        @inject(TYPES.NotificationRepository)
        private _fetchNotificationRepository: IFetchNotificationRepository
    ) {}

    /**
     * Retrieves all notifications for a given user.
     *
     * @param email - User's email
     * @returns List of notifications
     */

    async fetchNotifications(email: string): Promise<INotificationsResponse> {
        try {
            console.log('Service fetching notifications for:', email);

            if (!email) {
                throw new Error('Email is required');
            }

            const response: INotificationsResponse =
                await this._fetchNotificationRepository.fetchNotifications(
                    email
                );

            return response;
        } catch (error) {
            console.error('Error in notification service:', error);
            throw error;
        }
    }

    handleCancelDoctorApplication = async (
        data: ServiceCancelDoctorApplicationInput
    ): Promise<ServiceCancelDoctorApplicationOutput> => {
        try {
            if (!data.email || !Array.isArray(data.reasons)) {
                throw new Error(
                    'Invalid input: email and reasons array are required'
                );
            }

            const response =
                await this._fetchNotificationRepository.handleCancelDoctorApplication(
                    data
                );

            return {
                _id: response._id,
                email: response.email,
                message: response.message,
                type: response.type,
                isRead: response.isRead,
                createdAt: response.createdAt,
                paymentStatus: response.paymentStatus,
                paymentAmount: response.paymentAmount,
                paymentLink: response.paymentLink,
                updatedAt: response.updatedAt,
            };
        } catch (error) {
            console.error('Error in notification service:', error);
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
                                    'Error updating user status:',
                                    err
                                );
                                reject(err);
                                return;
                            }

                            console.log(
                                'Successfully updated doctor:',
                                grpcResponse
                            );
                            resolve(grpcResponse.success);
                        }
                    );
                });
            };

            try {
                const updateResult = await updateUserStatus();

                if (!updateResult) {
                    throw new Error('Failed to update doctor status');
                }
                return response;
            } catch (updateError) {
                console.error('Error updating doctor status:', updateError);

                throw new Error(
                    'Notification created but failed to update user status'
                );
            }
        } catch (error) {
            console.error('Error in notification use case:', error);
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
                    message: 'Email not found in session metadata',
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
                message: 'Event acknowledged but no action taken',
            };
        } catch (error) {
            console.error('Error processing webhook event:', error);
            return {
                success: false,
                message: `Error processing webhook: ${
                    error instanceof Error ? error.message : 'Unknown error'
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
            console.error('Error in notification use case:', error);
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
            console.error('Error in notification use case:', error);
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
            console.log('Error in stripe payment service:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                sessionId: null,
                url: null,
            };
        }
    }
}
