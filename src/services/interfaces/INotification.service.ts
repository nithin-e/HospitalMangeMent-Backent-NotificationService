import { IGrpcNotificationResponse } from '@/types/notificationTypes';
import {

    NotificationProtoResponse,
    ServiceCancelDoctorApplicationInput,
    ServiceCancelDoctorApplicationOutput,
} from '../../types/types';
import { IStoreNotificationService } from './IStore-notification.service';
import { IStripePaymentService } from './IStripe-modal.service';

export interface INotificationService
    extends IStoreNotificationService,
        IStripePaymentService {
    fetchNotifications(email: string): Promise<IGrpcNotificationResponse>;
    handleCancelDoctorApplication(
        data: ServiceCancelDoctorApplicationInput
    ): Promise<NotificationProtoResponse>;
}
