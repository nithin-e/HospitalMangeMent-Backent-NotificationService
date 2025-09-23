import {
  NotificationProtoResponse,
  ServiceCancelDoctorApplicationOutput,
  TimestampProto,
} from "interfaces/types";

export class DoctorApplicationMapper {
  static toGrpcResponse(
    email: string,
    dbResponse: ServiceCancelDoctorApplicationOutput
  ): NotificationProtoResponse {
    return {
      user_id: email,
      title: "Application Rejected",
      message: dbResponse.message,
      type: this.mapNotificationType(dbResponse.type),
      is_read: dbResponse.isRead,
      created_at: this.dateToTimestamp(dbResponse.createdAt),
      payment_amount: dbResponse.paymentAmount || 0,
      payment_link: dbResponse.paymentLink || "",
      payment_status: this.mapPaymentStatus(dbResponse.paymentStatus),
    };
  }

  private static mapNotificationType(type: string): number {
    switch (type) {
      case "INFO":
        return 1;
      case "APPROVAL":
        return 2;
      case "PAYMENT":
        return 3;
      case "ALERT":
        return 4;
      default:
        return 0;
    }
  }

  private static mapPaymentStatus(status: string): number {
    switch (status) {
      case "PENDING":
        return 1;
      case "COMPLETED":
        return 2;
      case "FAILED":
        return 3;
      default:
        return 0;
    }
  }

  private static dateToTimestamp(date: Date): TimestampProto {
    const timestamp = new Date(date).getTime();
    const seconds = Math.floor(timestamp / 1000);
    const nanos = (timestamp % 1000) * 1000000;

    return { seconds, nanos };
  }
}
