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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
require("dotenv/config");
const mongo_1 = __importDefault(require("./config/mongo"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
// MongoDB connection
console.log('Attempting to connect to MongoDB...');
(0, mongo_1.default)().then(() => {
    console.log('MongoDB connection successful in Notification service');
}).catch(err => {
    console.error('MongoDB connection failed:', err);
});
// Change all these imports from "../src/" to "./"
const fecthNotificationController_1 = __importDefault(require("./controller/implementation/fecthNotificationController"));
const storeNotificationController_1 = __importDefault(require("./controller/implementation/storeNotificationController"));
const handleCanceldoctorApplicationCon_1 = __importDefault(require("./controller/implementation/handleCanceldoctorApplicationCon"));
const stripModalController_1 = __importDefault(require("./controller/implementation/stripModalController"));
//import services
const fecthNotificationService_1 = __importDefault(require("./Services/implementation/fecthNotificationService"));
const storeNotificationservice_1 = __importDefault(require("./Services/implementation/storeNotificationservice"));
const handleCanceldoctorApplicationInService_1 = __importDefault(require("./Services/implementation/handleCanceldoctorApplicationInService"));
const stripeModalService_1 = __importDefault(require("./Services/implementation/stripeModalService"));
//import repo
const fecthNotificationRepo_1 = __importDefault(require("./repositories/implementation/fecthNotificationRepo"));
const storeNotificationRepo_1 = __importDefault(require("./repositories/implementation/storeNotificationRepo"));
const handleCanceldoctorApplicationRepo_1 = __importDefault(require("./repositories/implementation/handleCanceldoctorApplicationRepo"));
const stripModalRepo_1 = __importDefault(require("./repositories/implementation/stripModalRepo"));
const consumer_1 = require("./event/consumer");
// // Import controllers
// import fetchNotificationsControllerr from "./controller/implementation/fecthNotificationController";
// import storeNotificationController from './controller/implementation/storeNotificationController'
// import handleCanceldoctorApplicationControllerr from "./controller/implementation/handleCanceldoctorApplicationCon";
// import stripModalController from "./controller/implementation/stripModalController";
// //import services
// import fecthNotificationService from './Services/implementation/fecthNotificationService';
// import storeNotificationservice from './Services/implementation/storeNotificationservice';
// import handleCanceldoctorApplicationInService from "./Services/implementation/handleCanceldoctorApplicationInService";
// import stripeModalService from "./Services/implementation/stripeModalService";
// //import repo
// import fecthNotificationRepo from "../src/repositories/implementation/fecthNotificationRepo";
// import storeNotificationRepo from "../src/repositories/implementation/storeNotificationRepo";
// import handleCanceldoctorApplicationRepo from "../src/repositories/implementation/handleCanceldoctorApplicationRepo";
// import stripModalRepo from "../src/repositories/implementation/stripModalRepo";
// import { Consumer } from './event/consumer';
// Initialize dependency chain for handleCanceldoctorApplication
const HandleCanceldoctorApplicationRepo = new handleCanceldoctorApplicationRepo_1.default();
const HandleCanceldoctorApplicationInService = new handleCanceldoctorApplicationInService_1.default(HandleCanceldoctorApplicationRepo);
const HandleCanceldoctorApplicationController = new handleCanceldoctorApplicationCon_1.default(HandleCanceldoctorApplicationInService);
// Initialize dependency chain for fetching notifications
const FecthNotificationRepo = new fecthNotificationRepo_1.default();
const FecthNotificationService = new fecthNotificationService_1.default(FecthNotificationRepo);
const FetchNotificationsController = new fecthNotificationController_1.default(FecthNotificationService);
// Initialize dependency chain for store notifications
const StoreNotificationRepo = new storeNotificationRepo_1.default();
const StoreNotificationservice = new storeNotificationservice_1.default(StoreNotificationRepo);
const StoreNotificationController = new storeNotificationController_1.default(StoreNotificationservice);
const StripModalRepo = new stripModalRepo_1.default();
const StripeModalService = new stripeModalService_1.default(StripModalRepo);
const StripModalController = new stripModalController_1.default(StripeModalService);
const consumer = new consumer_1.Consumer(StoreNotificationController); //injecr the controller 
consumer.start()
    .catch(err => {
    process.exit(1);
});
// Create Express app and HTTP server for Socket.io
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
// Log frontend URL for CORS
const frontendUrl = process.env.NODE_ENV === 'dev' ?
    "http://localhost:3001" :
    ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
console.log('Frontend URL for CORS:', frontendUrl);
// Set up Socket.io with CORS settings
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST"],
        credentials: true
    }
});
console.log('Socket.io server created with CORS settings');
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
const grpcServer = new grpc.Server({
    'grpc.max_send_message_length': 10 * 1024 * 1024,
    'grpc.max_receive_message_length': 10 * 1024 * 1024
});
console.log('gRPC server created');
// Add gRPC services
console.log('Adding services to gRPC server...');
grpcServer.addService(NotificationProto.NotificationService.service, {
    CreateNotification: StoreNotificationController.storeNotificationData,
    // HandleStripeWebhook: StoreNotificationController.handleStripeWebhook,
    handleCanceldoctorApplication: HandleCanceldoctorApplicationController.handleCancelDoctorApplication,
    fecthAllNotifications: FetchNotificationsController.fetchNotifications.bind(FetchNotificationsController),
    rescheduleAppointmentNotification: StoreNotificationController.rescheduleAppointmentNotification,
    CreateCheckoutSession: StripModalController.createCheckoutSession,
    createAdminBlockingNotification: StoreNotificationController.createAdminBlockNotification
});
// HandleStripeWebhook
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
