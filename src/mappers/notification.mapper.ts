// mappers/notification.mapper.ts

import { IGrpcNotificationResponse } from "../types/notificationTypes";
import { INotificationsResponse } from "../types/types";


export class NotificationMapper {
    static toGrpcResponse(
        response: INotificationsResponse
    ): IGrpcNotificationResponse {
        return {
            notification: response.notification.map((notification) => ({
                id: notification.id,
                user_id: notification.email,
                message: notification.message,
                type: this.getNotificationType(notification.type),
                is_read: notification.isRead,
                created_at: this.timestampFromDate(notification.createdAt),
                payment_amount: notification.paymentAmount || 0,
                payment_link: notification.paymentLink || '',
                payment_status: this.getPaymentStatus(
                    notification.paymentStatus
                ),
            })),
            success: response.success,
        };
    }

    private static getNotificationType(type: string): number {
        switch (type) {
            case 'INFO':
                return 1;
            case 'APPROVAL':
                return 2;
            case 'PAYMENT':
                return 3;
            case 'ALERT':
                return 4;
            default:
                return 0;
        }
    }

    private static getPaymentStatus(status: string): number {
        switch (status) {
            case 'PENDING':
                return 1;
            case 'COMPLETED':
                return 2;
            case 'FAILED':
                return 3;
            default:
                return 0;
        }
    }

    private static timestampFromDate(date: Date | string | undefined) {
        if (!date) return null;

        const milliseconds = new Date(date).getTime();
        return {
            seconds: Math.floor(milliseconds / 1000),
            nanos: (milliseconds % 1000) * 1000000,
        };
    }
}
