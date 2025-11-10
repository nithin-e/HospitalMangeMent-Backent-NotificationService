"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
const notification_controller_1 = require("../controllers/notification.controller");
const notification_repository_1 = require("../repositories/implementation/notification.repository");
const notification_service_1 = require("../services/implementations/notification.service");
const inversify_2 = require("../types/inversify");
exports.container = new inversify_1.Container();
exports.container
    .bind(inversify_2.TYPES.NotificationRepository)
    .to(notification_repository_1.NotificationRepository);
exports.container
    .bind(inversify_2.TYPES.NotificationService)
    .to(notification_service_1.NotificationService);
exports.container.bind(inversify_2.TYPES.NotificationController).to(notification_controller_1.NotificationController);
