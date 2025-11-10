import {
    NotificationRequest,
    NotificationRepositoryResponse,
    RescheduleRequest,
    RescheduleRepositoryResponse,
    AdminBlockRequest,
    AdminBlockRepositoryResponse,
} from '../../types/types';

export interface IStoreNotificationRepository {
    storeNotificationData(
        data: NotificationRequest
    ): Promise<NotificationRepositoryResponse>;
    updatePaymentStatus(
        email: string,
        status: string,
        transactionId?: string
    ): Promise<boolean>;
    rescheduleAppointmentNotification(
        data: RescheduleRequest
    ): Promise<RescheduleRepositoryResponse>;
    createAdminBlockNotification(
        data: AdminBlockRequest
    ): Promise<AdminBlockRepositoryResponse>;
}
