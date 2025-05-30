"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
require("dotenv/config");
const mongo_1 = __importDefault(require("./config/mongo"));
const path_1 = __importDefault(require("path"));
// import { handleStripeWebhook } from './stripe/stripeWebhookHandler';
// import controllers
const storeNotificationController_1 = __importDefault(require("../src/controller/storeNotificationController"));
const fecthNotificationController_1 = __importDefault(require("../src/controller/fecthNotificationController"));
// mongoconnection
console.log('Attempting to connect to MongoDB...');
(0, mongo_1.default)().then(() => {
    console.log('MongoDB connection successful in Notication servise');
}).catch(err => {
    console.error('MongoDB connection failed:', err);
});
console.log('Initializing controllers...');
const StoreNotificationData = new storeNotificationController_1.default();
const FecthNotificationController = new fecthNotificationController_1.default();
console.log('Controllers initialized');
const app = (0, express_1.default)();
// const httpServer = http.createServer(app);
// Load proto file for gRPC
console.log('Loading proto file for gRPC...');
const protoPath = path_1.default.resolve(__dirname, './proto/Notification.proto');
console.log('Proto file path:', protoPath);
const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
console.log('Proto file loaded successfully');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const NotificationProto = grpcObject.notification;
if (!NotificationProto || !NotificationProto.NotificationService) {
    console.error("Failed to load the User service from the proto file.");
    process.exit(1);
}
console.log('User service found in proto file');
// Create gRPC server
// In notification service where you create the grpc server
const grpcServer = new grpc.Server({
    'grpc.max_send_message_length': 10 * 1024 * 1024, // 10MB
    'grpc.max_receive_message_length': 10 * 1024 * 1024 // 10MB
});
console.log('gRPC server created');
// Add gRPC services
console.log('Adding services to gRPC server...');
grpcServer.addService(NotificationProto.NotificationService.service, {
    CreateNotification: StoreNotificationData.storeNotificationData,
    fecthAllNotifications: FecthNotificationController.fetchingNotification,
    HandleStripeWebhook: StoreNotificationData.handleStripeWebhook
});
console.log('Services added to gRPC server');
// Start gRPC server
const startGrpcServer = () => {
    const port = process.env.Notification_GRPC_PORT || '5001';
    const domain = process.env.NODE_ENV === 'dev' ? process.env.DEV_DOMAIN : process.env.PRO_DOMAIN_USER;
    console.log(`Preparing to start gRPC server on ${domain}:${port}`);
    grpcServer.bindAsync(`${domain}:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
        if (err) {
            console.error("Error starting gRPC server:", err);
            return;
        }
        grpcServer.start();
        console.log("\x1b[42m\x1b[30m%s\x1b[0m", `🚀 [INFO] gRPC Notification server started on port: ${bindPort} ✅`);
    });
};
// Start both servers
console.log('Starting servers...');
startGrpcServer();
