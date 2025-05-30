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


// Import controllers
import fetchNotificationsControllerr from "../src/controllerr/implementation/fecthNotificationController";
import storeNotificationController from '../src/controllerr/implementation/storeNotificationController'
import handleCanceldoctorApplicationControllerr from "../src/controllerr/implementation/handleCanceldoctorApplicationCon";


//import services
import fecthNotificationService from '../src/Servicess/implementation/fecthNotificationService';
import storeNotificationservice from '../src/Servicess/implementation/storeNotificationservice';
import handleCanceldoctorApplicationInService from "../src/Servicess/implementation/handleCanceldoctorApplicationInService";


//import repo
import fecthNotificationRepo from "../src/repositories/implementation/fecthNotificationRepo";
import storeNotificationRepo from "../src/repositories/implementation/storeNotificationRepo";
import handleCanceldoctorApplicationRepo from "../src/repositories/implementation/handleCanceldoctorApplicationRepo";



// Initialize dependency chain for handleCanceldoctorApplication
const HandleCanceldoctorApplicationRepo=new handleCanceldoctorApplicationRepo()
const HandleCanceldoctorApplicationInService=new handleCanceldoctorApplicationInService(HandleCanceldoctorApplicationRepo)
const HandleCanceldoctorApplicationControllerr=new handleCanceldoctorApplicationControllerr(HandleCanceldoctorApplicationInService)



// Initialize dependency chain for fetching notifications
const FecthNotificationRepo = new fecthNotificationRepo();
const FecthNotificationService = new fecthNotificationService(FecthNotificationRepo);
const FetchNotificationsControllerr = new fetchNotificationsControllerr(FecthNotificationService);

// Initialize dependency chain for store notifications
const StoreNotificationRepo=new storeNotificationRepo()
const StoreNotificationservice= new storeNotificationservice(StoreNotificationRepo)
const StoreNotificationController=new storeNotificationController(StoreNotificationservice)






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

// Create notification namespace
const notificationNamespace = io.of('/notifications');
console.log('Notification namespace created');

// Socket.io event handlers
notificationNamespace.on('connection', (socket) => {
  console.log('Notification client connected:', socket.id);

  // Socket.io event handler for user notifications
  socket.on('user_data', async (userData: { userEmail: string }, callback: (response: { 
    success: boolean; 
    notifications?: any[]; 
    error?: string; 
  }) => void) => {
    console.log('Received user_data event with data:', userData);

    try {
      // You can implement this using your FetchNotificationsControllerr if needed
      // const result = await FetchNotificationsControllerr.fetchingNotification({ request: { email: userData.userEmail } }, (err, response) => {
      //   if (err) {
      //     callback({ success: false, error: err.message });
      //   } else {
      //     callback({ success: true, notifications: response.notification || [] });
      //   }
      // });
      
      // For now, just return an empty success response
      callback({ success: true, notifications: [] });
    } catch (error: any) {
      console.error('Error in user_data event handler:', error);
      
      // Invoke callback with error response
      callback({ 
        success: false, 
        error: error.message 
      });
    }
  });
  
  // Handle user subscription to their notifications
  socket.on('subscribe_to_notifications', (userData: { userId: string }) => {
    console.log(`User ${userData.userId} subscribed to notifications`);
    socket.join(userData.userId);
  });
  
  // Handle user unsubscription
  socket.on('unsubscribe_from_notifications', (userData: { userId: string }) => {
    console.log(`User ${userData.userId} unsubscribed from notifications`);
    socket.leave(userData.userId);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Notification client disconnected:', socket.id);
  });
});

// Function to emit notification to specific user
export const emitNotification = (userId: string, notification: any) => {
  notificationNamespace.to(userId).emit('new_notification', notification);
};

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
  HandleStripeWebhook: StoreNotificationController.handleStripeWebhook,
  handleCanceldoctorApplication: HandleCanceldoctorApplicationControllerr.handleCanceldoctor_Application,
  fecthAllNotifications: FetchNotificationsControllerr.fetchingNotification.bind(FetchNotificationsControllerr)
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

// Start HTTP server for Socket.io
const startSocketServer = () => {
  const port = process.env.NOTIFICATION_SOCKET_PORT || '5002';
  console.log(`Preparing to start Socket.io server on port ${port}`);
  
  httpServer.listen(port, () => {
    console.log("\x1b[42m\x1b[30m%s\x1b[0m", `🚀 [INFO] Socket.io Notification server started on port: ${port} ✅`);
  });
  
  // Add error handler for the HTTP server
  httpServer.on('error', (error) => {
    console.error('HTTP Server error:', error);
  });
};

// Start both servers
console.log('Starting servers...');
startGrpcServer();
startSocketServer();