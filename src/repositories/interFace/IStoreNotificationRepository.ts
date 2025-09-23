import {
  AdminBlockRepositoryResponse,
  AdminBlockRequest,
  NotificationRepositoryResponse,
  NotificationRequest,
  RescheduleRepositoryResponse,
  RescheduleRequest,
} from "interfaces/types";

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
