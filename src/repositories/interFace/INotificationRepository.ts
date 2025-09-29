import {
    CancelDoctorApplicationInput,
    CancelDoctorApplicationOutput,
    INotificationsResponse,
} from '@/types/types';
import { IStoreNotificationRepository } from './IStoreNotificationRepository';
import { IStripePaymentRepository } from './IStripeModalRepository';

export interface IFetchNotificationRepository
    extends IStoreNotificationRepository,
        IStripePaymentRepository {
    fetchNotifications(email: string): Promise<INotificationsResponse>;
    handleCancelDoctorApplication(
        data: CancelDoctorApplicationInput
    ): Promise<CancelDoctorApplicationOutput>;
}
