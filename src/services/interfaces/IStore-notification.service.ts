import {
    NotificationRequest,
    NotificationServiceResponse,
    WebhookResponse,
    RescheduleRepositoryResponse,
    AdminBlockRepositoryResponse,
} from '@/types/types';

export interface IStoreNotificationService {
    storeNotificationData(
        data: NotificationRequest
    ): Promise<NotificationServiceResponse>;
    processWebhookEvent(
        email?: string,
        transactionId?: string
    ): Promise<WebhookResponse>;
    rescheduleAppointmentNotification(data: {
        email: string;
        time: string;
    }): Promise<RescheduleRepositoryResponse>;
    createAdminBlockNotification(data: {
        email: string;
        reason: string;
    }): Promise<AdminBlockRepositoryResponse>;
}
