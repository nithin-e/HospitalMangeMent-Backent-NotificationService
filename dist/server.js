"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongo_config_1 = __importDefault(require("./config/mongo.config"));
const consumer_1 = require("./event/consumer");
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importDefault(require("express"));
const notification_routes_1 = __importDefault(require("./route/notification.routes"));
const inversify_1 = require("./types/inversify");
const server_1 = require("./grpc/server");
const inversify_config_1 = require("./config/inversify.config");
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(notification_routes_1.default);
async function bootstrap() {
    await (0, mongo_config_1.default)();
    const notificationController = inversify_config_1.container.get(inversify_1.TYPES.NotificationController);
    const consumer = new consumer_1.Consumer(notificationController);
    await consumer.start();
    (0, server_1.startGrpcServer)();
    app.listen(process.env.PORT, () => {
        console.log('Notification-service running on port: ', process.env.PORT);
    });
}
bootstrap();
