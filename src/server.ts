import 'dotenv/config';
import connectDB from './config/mongo.config';
import { Consumer } from './event/consumer';
import { startGrpcServer } from './grpc/server';
import { NotificationController } from './controllers/notification.controller';

async function bootstrap() {
    await connectDB();

    const consumer = new Consumer(NotificationController);
    await consumer.start();

    startGrpcServer();
}

bootstrap();
