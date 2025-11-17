import { ProtoNotification, TimestampProto } from '../types/types';
import {
    convertTypeToProtoEnum,
    convertStatusToProtoEnum,
} from '../utility/enumsConverter';

export class StoreNotificationMapper {
    static toGrpcResponse(notification: Notification): ProtoNotification {
        return {
            id: notification.id.toString(),
            user_id: notification.email || '',
            title: '',
            message: notification.message,
            type: convertTypeToProtoEnum(notification.type),
            is_read: notification.isRead,
            created_at: this.dateToTimestamp(notification.createdAt),
            payment_amount: Number(notification.paymentAmount) || 0,
            payment_link: notification.paymentLink || '',
            payment_status: convertStatusToProtoEnum(
                notification.paymentStatus
            ),
        };
    }

    // private static dateToTimestamp(date: Date): TimestampProto {
    //     const timestamp = new Date(date).getTime();
    //     const seconds = Math.floor(timestamp / 1000);
    //     const nanos = (timestamp % 1000) * 1_000_000;

    //     return { seconds, nanos };
    // }

    private static dateToTimestamp(date: Date | string): TimestampProto {
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        const timestamp = parsedDate.getTime();
        const seconds = Math.floor(timestamp / 1000);
        const nanos = (timestamp % 1000) * 1_000_000;

        return { seconds, nanos };
    }
}

interface Notification {
    id: string | number;
    email?: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date | string;
    paymentAmount?: number | string;
    paymentLink?: string;
    paymentStatus: string;
}
