import express from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { TYPES } from '../types/inversify';
import { container } from '../config/inversify.config';

const notificationRoute = express.Router();

export const notificationController = container.get<NotificationController>(
    TYPES.NotificationController
);

notificationRoute.post(
    '/storeNotificationData',
    notificationController.storeNotificationData
);
notificationRoute.post(
    '/handleCanceldoctorApplication',
    notificationController.handleCancelDoctorApplication
);
notificationRoute.post(
    '/create-checkout-session',
    notificationController.createCheckoutSession
);

export default notificationRoute;
