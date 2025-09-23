import fetchNotificationsController from "./controller/implementation/notificationController";
import storeNotificationController from "./controller/implementation/storeNotificationController";
import canceldoctorApplicationController from "./controller/implementation/canceldoctorApplicationController";
import stripModalController from "./controller/implementation/stripModalController";

import notificationRepo from "./repositories/implementation/notificationRepository";
import storeNotificationRepo from "./repositories/implementation/storeNotificationReposirory";
import canceldoctorApplicationRepo from "./repositories/implementation/canceldoctorApplicationRepository";
import stripModalRepo from "./repositories/implementation/stripModalRepository";

import notificationService from "./Services/implementation/notificationService";
import storeNotificationService from "./Services/implementation/storeNotificationService";
import canceldoctorApplicationService from "./Services/implementation/canceldoctorApplicationInService";
import stripeModalService from "./Services/implementation/stripeModalService";

// Cancel doctor application
const CancelDoctorRepo = new canceldoctorApplicationRepo();
const CancelDoctorService = new canceldoctorApplicationService(CancelDoctorRepo);
export const CancelDoctorController = new canceldoctorApplicationController(CancelDoctorService);

// Fetch notifications
const NotificationRepo = new notificationRepo();
const NotificationService = new notificationService(NotificationRepo);
export const FetchNotificationsController = new fetchNotificationsController(NotificationService);

// Store notifications
const StoreRepo = new storeNotificationRepo();
const StoreService = new storeNotificationService(StoreRepo);
export const StoreNotificationController = new storeNotificationController(StoreService);

// Stripe
const StripeRepo = new stripModalRepo();
const StripeService = new stripeModalService(StripeRepo);
export const StripModalController = new stripModalController(StripeService);
