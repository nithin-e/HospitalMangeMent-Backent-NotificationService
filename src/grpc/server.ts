import * as grpc from '@grpc/grpc-js';
import { loadProto, createGrpcServer } from '../config/grpc.config';
import { notificationGrpcHandlers } from './handlers';

export const startGrpcServer = () => {
    const grpcObject = loadProto();
    const NotificationProto = grpcObject.notification;

    if (!NotificationProto || !NotificationProto.NotificationService) {
        console.error('❌ Failed to load NotificationService from proto');
        process.exit(1);
    }

    const grpcServer = createGrpcServer();
    grpcServer.addService(
        NotificationProto.NotificationService.service,
        notificationGrpcHandlers
    );

    const port = process.env.GRPC_PORT || '7002';

    grpcServer.bindAsync(
        '0.0.0.0:50051',
        grpc.ServerCredentials.createInsecure(),
        (err, bindPort) => {
            if (err) {
                console.error(
                    '❌ Error starting Notification gRPC server:',
                    err
                );
                return;
            }
            grpcServer.start();
            console.log(
                `🚀 [INFO] gRPC Notification server started on port: ${bindPort} ✅`
            );
        }
    );
};
