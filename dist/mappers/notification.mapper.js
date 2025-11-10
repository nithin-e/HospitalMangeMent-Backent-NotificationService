"use strict";
// mappers/notification.mapper.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMapper = void 0;
class NotificationMapper {
    static toGrpcResponse(response) {
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
                payment_status: this.getPaymentStatus(notification.paymentStatus),
            })),
            success: response.success,
        };
    }
    static getNotificationType(type) {
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
    static getPaymentStatus(status) {
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
    static timestampFromDate(date) {
        if (!date)
            return null;
        const milliseconds = new Date(date).getTime();
        return {
            seconds: Math.floor(milliseconds / 1000),
            nanos: (milliseconds % 1000) * 1000000,
        };
    }
}
exports.NotificationMapper = NotificationMapper;
