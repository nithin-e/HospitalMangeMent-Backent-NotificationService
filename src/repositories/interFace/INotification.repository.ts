import {
    INotificationsResponse,
    CancelDoctorApplicationInput,
    CancelDoctorApplicationOutput,
} from '../../types/types';
import { IStoreNotificationRepository } from './IStore-notification.repository';
import { IStripePaymentRepository } from './IStripe-modal.repository';

export interface INotificationRepository
    extends IStoreNotificationRepository,
        IStripePaymentRepository {
    fetchNotifications(email: string): Promise<INotificationsResponse>;
    handleCancelDoctorApplication(
        data: CancelDoctorApplicationInput
    ): Promise<CancelDoctorApplicationOutput>;
}
