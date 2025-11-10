import 'dotenv/config';
import connectDB from './config/mongo.config';
import { Consumer } from './event/consumer';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import { NotificationController } from './controllers/notification.controller';

import express from 'express';
import notificationRoute from './route/notification.routes';
import { TYPES } from './types/inversify';
import { startGrpcServer } from './grpc/server';
import { container } from './config/inversify.config';

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(notificationRoute);

async function bootstrap() {
    await connectDB();

    const notificationController = container.get<NotificationController>(
        TYPES.NotificationController
    );

    const consumer = new Consumer(notificationController);
    await consumer.start();

    startGrpcServer();

    app.listen(process.env.PORT!, () => {
        console.log(
            'Notification-service running on port: ',
            process.env.PORT!
        );
    });
}

bootstrap();
