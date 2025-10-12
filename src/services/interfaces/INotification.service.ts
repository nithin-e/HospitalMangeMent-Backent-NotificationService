import {
    INotificationsResponse,
    ServiceCancelDoctorApplicationInput,
    ServiceCancelDoctorApplicationOutput,
} from '@/types/types';
import { IStoreNotificationService } from './IStore-notification.service';
import { IStripePaymentService } from './IStripe-modal.service';

export interface IFetchNotificationService
    extends IStoreNotificationService,
        IStripePaymentService {
    fetchNotifications(email: string): Promise<INotificationsResponse>;
    handleCancelDoctorApplication(
        data: ServiceCancelDoctorApplicationInput
    ): Promise<ServiceCancelDoctorApplicationOutput>;
}
