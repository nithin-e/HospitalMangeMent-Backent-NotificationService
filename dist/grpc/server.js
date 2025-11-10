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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGrpcServer = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const notification_client_1 = require("../protoConfig/notification.client");
const handlers_1 = require("./handlers");
const startGrpcServer = () => {
    const grpcObject = (0, notification_client_1.loadProto)();
    const NotificationProto = grpcObject.notification;
    if (!NotificationProto || !NotificationProto.NotificationService) {
        console.error('❌ Failed to load NotificationService from proto');
        process.exit(1);
    }
    const grpcServer = (0, notification_client_1.createGrpcServer)();
    grpcServer.addService(NotificationProto.NotificationService.service, handlers_1.notificationGrpcHandlers);
    const port = process.env.GRPC_PORT || '5001';
    grpcServer.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
        if (err) {
            console.error('❌ Error starting Notification gRPC server:', err);
            return;
        }
        grpcServer.start();
        console.log(`🚀 [INFO] gRPC Notification server started on port: ${bindPort} ✅`);
    });
};
exports.startGrpcServer = startGrpcServer;
