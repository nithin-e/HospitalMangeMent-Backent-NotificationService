"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationGrpcHandlers = exports.notificationController = void 0;
const inversify_config_1 = require("../config/inversify.config");
const inversify_1 = require("../types/inversify");
exports.notificationController = inversify_config_1.container.get(inversify_1.TYPES.NotificationController);
exports.notificationGrpcHandlers = {
    fecthAllNotifications: exports.notificationController.fetchNotifications.bind(exports.notificationController),
};
