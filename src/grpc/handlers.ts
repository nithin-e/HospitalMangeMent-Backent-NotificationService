import { container } from "../config/inversify.config";
import { NotificationController } from "../controllers/notification.controller";
import { TYPES } from "../types/inversify";


export const notificationController = container.get<NotificationController>(
    TYPES.NotificationController
);

export const notificationGrpcHandlers = {
    fecthAllNotifications: notificationController.fetchNotifications.bind(
        notificationController
    ),
};
