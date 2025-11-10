import { Container } from 'inversify';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationRepository } from '../repositories/implementation/notification.repository';
import {  INotificationRepository } from '../repositories/interFace/INotification.repository';
import { NotificationService } from '../services/implementations/notification.service';
import {  INotificationService } from '../services/interfaces/INotification.service';
import { TYPES } from '../types/inversify';

export const container = new Container();

container
    .bind<INotificationRepository>(TYPES.NotificationRepository)
    .to(NotificationRepository);

container
    .bind<INotificationService>(TYPES.NotificationService)
    .to(NotificationService);

container.bind(TYPES.NotificationController).to(NotificationController);
