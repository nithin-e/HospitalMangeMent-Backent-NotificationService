import { container } from '@/config/inversify.config';
import { NotificationController } from '@/controllers/notification.controller';
import { TYPES } from '@/types/inversify';

export const notificationController = container.get<NotificationController>(
    TYPES.NotificationController
);

export const notificationGrpcHandlers = {
    CreateNotification: notificationController.storeNotificationData,
    handleCanceldoctorApplication:
        notificationController.handleCancelDoctorApplication,
    fecthAllNotifications: notificationController.fetchNotifications.bind(
        notificationController
    ),
    rescheduleAppointmentNotification:
        notificationController.rescheduleAppointmentNotification,
    CreateCheckoutSession: notificationController.createCheckoutSession,
    createAdminBlockingNotification:
        notificationController.createAdminBlockNotification,
};
