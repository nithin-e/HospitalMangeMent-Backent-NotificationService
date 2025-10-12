import 'dotenv/config';
import connectDB from './config/mongo.config';
import { Consumer } from './event/consumer';
import morgan from 'morgan';
import { container } from '@/config/inversify.config';


import { NotificationController } from './controllers/notification.controller';

import express from 'express';
import notificationRoute from './route/notification.routes';
import { TYPES } from './types/inversify';

const app = express();

app.use(morgan("dev"))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(notificationRoute)




async function bootstrap() {
  await connectDB();

  const notificationController = container.get<NotificationController>(TYPES.NotificationController);

  const consumer = new Consumer(notificationController);
  await consumer.start();
}



bootstrap();
