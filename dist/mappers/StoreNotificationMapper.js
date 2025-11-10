"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreNotificationMapper = void 0;
const enumsConverter_1 = require("../utility/enumsConverter");
class StoreNotificationMapper {
    static toGrpcResponse(notification) {
        return {
            id: notification.id.toString(),
            user_id: notification.email || '',
            title: '',
            message: notification.message,
            type: (0, enumsConverter_1.convertTypeToProtoEnum)(notification.type),
            is_read: notification.isRead,
            created_at: this.dateToTimestamp(notification.createdAt),
            payment_amount: Number(notification.paymentAmount) || 0,
            payment_link: notification.paymentLink || '',
            payment_status: (0, enumsConverter_1.convertStatusToProtoEnum)(notification.paymentStatus),
        };
    }
    static dateToTimestamp(date) {
        const timestamp = new Date(date).getTime();
        const seconds = Math.floor(timestamp / 1000);
        const nanos = (timestamp % 1000) * 1000000;
        return { seconds, nanos };
    }
}
exports.StoreNotificationMapper = StoreNotificationMapper;
