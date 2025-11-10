import { ProtoNotification, TimestampProto } from "../types/types";
import { convertTypeToProtoEnum, convertStatusToProtoEnum } from "../utility/enumsConverter";


export class StoreNotificationMapper {
    static toGrpcResponse(notification: any): ProtoNotification {
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

    private static dateToTimestamp(date: Date): TimestampProto {
        const timestamp = new Date(date).getTime();
        const seconds = Math.floor(timestamp / 1000);
        const nanos = (timestamp % 1000) * 1_000_000;

        return { seconds, nanos };
    }
}
