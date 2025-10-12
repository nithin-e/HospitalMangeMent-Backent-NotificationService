import { NotificationController } from '@/controllers/notification.controller';
import { NotificationRepository } from '@/repositories/implementation/notification.repository';
import { IFetchNotificationRepository } from '@/repositories/interFace/INotification.repository';
import { NotificationService } from '@/services/implementations/notification.service';
import { IFetchNotificationService } from '@/services/interfaces/INotification.service';
import { TYPES } from '@/types/inversify';
import { Container } from 'inversify';

export const container = new Container();

container
    .bind<IFetchNotificationRepository>(TYPES.NotificationRepository)
    .to(NotificationRepository);

container
    .bind<IFetchNotificationService>(TYPES.NotificationService)
    .to(NotificationService);

container.bind(TYPES.NotificationController).to(NotificationController);
