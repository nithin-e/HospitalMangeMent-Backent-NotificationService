import { StoreNotificationController, CancelDoctorController, FetchNotificationsController, StripModalController } from "../app";

export const notificationGrpcHandlers = {
  CreateNotification: StoreNotificationController.storeNotificationData,
  handleCanceldoctorApplication: CancelDoctorController.handleCancelDoctorApplication,
  fecthAllNotifications: FetchNotificationsController.fetchNotifications.bind(FetchNotificationsController),
  rescheduleAppointmentNotification: StoreNotificationController.rescheduleAppointmentNotification,
  CreateCheckoutSession: StripModalController.createCheckoutSession,
  createAdminBlockingNotification: StoreNotificationController.createAdminBlockNotification,
};
