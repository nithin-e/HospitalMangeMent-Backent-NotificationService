import {
    INotificationsResponse,
    ServiceCancelDoctorApplicationInput,
    ServiceCancelDoctorApplicationOutput,
} from '@/types/types';
import { IStoreNotificationService } from './IStoreNotificationService';
import { IStripePaymentService } from './IStripeModalService';

export interface IFetchNotificationService
    extends IStoreNotificationService,
        IStripePaymentService {
    fetchNotifications(email: string): Promise<INotificationsResponse>;
    handleCancelDoctorApplication(
        data: ServiceCancelDoctorApplicationInput
    ): Promise<ServiceCancelDoctorApplicationOutput>;
}
