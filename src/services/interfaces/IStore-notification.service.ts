import {
    NotificationRequest,
    NotificationServiceResponse,
    WebhookResponse,
    AdminBlockRepositoryResponse,
    RescheduleResponse,
} from '../../types/types';

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
    }): Promise<RescheduleResponse>;
    createAdminBlockNotification(data: {
        email: string;
        reason: string;
    }): Promise<AdminBlockRepositoryResponse>;
}
