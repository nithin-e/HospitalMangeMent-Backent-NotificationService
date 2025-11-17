import {
    NotificationRequest,
    NotificationRepositoryResponse,
    RescheduleRequest,
    // RescheduleRepositoryResponse,
    AdminBlockRequest,
    AdminBlockRepositoryResponse,
    RescheduleResponse,
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
    ): Promise<RescheduleResponse>;
    createAdminBlockNotification(
        data: AdminBlockRequest
    ): Promise<AdminBlockRepositoryResponse>;
}
