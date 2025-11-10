"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorApplicationMapper = void 0;
class DoctorApplicationMapper {
    static toGrpcResponse(email, dbResponse) {
        return {
            user_id: email,
            title: 'Application Rejected',
            message: dbResponse.message,
            type: this.mapNotificationType(dbResponse.type),
            is_read: dbResponse.isRead,
            created_at: this.dateToTimestamp(dbResponse.createdAt),
            payment_amount: dbResponse.paymentAmount || 0,
            payment_link: dbResponse.paymentLink || '',
            payment_status: this.mapPaymentStatus(dbResponse.paymentStatus),
        };
    }
    static mapNotificationType(type) {
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
    static mapPaymentStatus(status) {
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
    static dateToTimestamp(date) {
        const timestamp = new Date(date).getTime();
        const seconds = Math.floor(timestamp / 1000);
        const nanos = (timestamp % 1000) * 1000000;
        return { seconds, nanos };
    }
}
exports.DoctorApplicationMapper = DoctorApplicationMapper;
