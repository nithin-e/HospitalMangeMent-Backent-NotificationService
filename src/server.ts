import http from 'http';
import express from 'express';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import "dotenv/config";
import connectDB from "./config/mongo";
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';


// MongoDB connection
console.log('Attempting to connect to MongoDB...');
connectDB().then(() => {
  console.log('MongoDB connection successful in Notification service');
}).catch(err => {
  console.error('MongoDB connection failed:', err);
});



// Change all these imports from "../src/" to "./"
import fetchNotificationsControllerr from "./controller/implementation/notificationController";
import storeNotificationController from './controller/implementation/storeNotificationController'
import handleCanceldoctorApplicationControllerr from "./controller/implementation/canceldoctorApplicationController";
import stripModalController from "./controller/implementation/stripModalController";

//import services
import fecthNotificationService from './Services/implementation/notificationService';
import storeNotificationservice from './Services/implementation/storeNotificationService';
import handleCanceldoctorApplicationInService from "./Services/implementation/canceldoctorApplicationInService";
import stripeModalService from "./Services/implementation/stripeModalService";

//import repo
import fecthNotificationRepo from "./repositories/implementation/notificationRepository";
import storeNotificationRepo from "./repositories/implementation/storeNotificationReposirory";
import handleCanceldoctorApplicationRepo from "./repositories/implementation/canceldoctorApplicationRepository";
import stripModalRepo from "./repositories/implementation/stripModalRepository";
import { Consumer } from './event/consumer';





// Initialize dependency chain for handleCanceldoctorApplication
const HandleCanceldoctorApplicationRepo=new handleCanceldoctorApplicationRepo()
const HandleCanceldoctorApplicationInService=new handleCanceldoctorApplicationInService(HandleCanceldoctorApplicationRepo)
const HandleCanceldoctorApplicationController=new handleCanceldoctorApplicationControllerr(HandleCanceldoctorApplicationInService)



// Initialize dependency chain for fetching notifications
const FecthNotificationRepo = new fecthNotificationRepo();
const FecthNotificationService = new fecthNotificationService(FecthNotificationRepo);
const FetchNotificationsController = new fetchNotificationsControllerr(FecthNotificationService);

// Initialize dependency chain for store notifications
const StoreNotificationRepo=new storeNotificationRepo()
const StoreNotificationservice= new storeNotificationservice(StoreNotificationRepo)
const StoreNotificationController=new storeNotificationController(StoreNotificationservice)


const StripModalRepo=new stripModalRepo()
const StripeModalService=new stripeModalService(StripModalRepo) 
const StripModalController=new stripModalController(StripeModalService)


const consumer=new Consumer(StoreNotificationController)//injecr the controller 
consumer.start()
.catch(err=>{
  process.exit(1)
})

// Create Express app and HTTP server for Socket.io
const app = express();
const httpServer = http.createServer(app);

// Log frontend URL for CORS
const frontendUrl = process.env.NODE_ENV === 'dev' ? 
  "http://localhost:3001" : 
  process.env.ALLOWED_ORIGINS?.split(',') || [];
console.log('Frontend URL for CORS:', frontendUrl);

// Set up Socket.io with CORS settings
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"],
    credentials: true
  }
});
console.log('Socket.io server created with CORS settings');





// Load proto file for gRPC
console.log('Loading proto file for gRPC...');
const protoPath = path.resolve(__dirname, './proto/Notification.proto');
console.log('Proto file path:', protoPath);
const packageDef = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
console.log('Proto file loaded successfully');

const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as any;
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
  rescheduleAppointmentNotification:StoreNotificationController.rescheduleAppointmentNotification,
  CreateCheckoutSession: StripModalController.createCheckoutSession,
   createAdminBlockingNotification:StoreNotificationController.createAdminBlockNotification
});

// HandleStripeWebhook
console.log('Services added to gRPC server');

// Start gRPC server
const startGrpcServer = () => {
  console.log(`Preparing to start gRPC server on 0.0.0.0`);
  
  const GRPC_PORT= process.env.GRPC_PORT

  grpcServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
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
