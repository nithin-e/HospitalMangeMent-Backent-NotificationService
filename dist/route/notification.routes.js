"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const express_1 = __importDefault(require("express"));
const inversify_1 = require("../types/inversify");
const inversify_config_1 = require("../config/inversify.config");
const notificationRoute = express_1.default.Router();
exports.notificationController = inversify_config_1.container.get(inversify_1.TYPES.NotificationController);
notificationRoute.post('/storeNotificationData', exports.notificationController.storeNotificationData);
notificationRoute.post('/handleCanceldoctorApplication', exports.notificationController.handleCancelDoctorApplication);
notificationRoute.post('/create-checkout-session', exports.notificationController.createCheckoutSession);
exports.default = notificationRoute;
