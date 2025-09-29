import { INotification } from '@/types/notificationTypes';

export interface Timestamp {
    seconds: number;
    nanos: number;
}

export interface NotificationItem {
    id?: string;
    user_id?: string;
    email?: string;
    message?: string;
    type?: number;
    is_read?: boolean;
    created_at?: Timestamp | null;
    payment_amount?: number;
    payment_link?: string;
    payment_status?: number;
}

export interface NotificationResponse {
    notification: NotificationItem[];
    success: boolean;
}

// Types for controller layer
export interface GrpcCallRequest {
    email: string;
    reasons: string[];
}

export interface GrpcCall {
    request: GrpcCallRequest;
}

export interface TimestampProto {
    seconds: number;
    nanos: number;
}

export interface NotificationProtoResponse {
    user_id: string;
    title: string;
    message: string;
    type: number;
    is_read: boolean;
    created_at: TimestampProto;
    payment_amount: number;
    payment_link: string;
    payment_status: number;
}

export type GrpcError =
    | Error
    | { code: number; message: string; details?: string };

export interface GrpcCallback {
    (
        error: GrpcError | null,
        response?: { notification: NotificationProtoResponse }
    ): void;
}

export interface ProtoNotification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: number;
    is_read: boolean;
    created_at: { seconds: number; nanos: number };
    payment_amount: number;
    payment_link: string;
    payment_status: number;
}

export interface IEventData {
    email?: string;
    transactionId?: string;
}

export interface GrpcCallback<TResponse = unknown> {
    (error: GrpcError | null, response: TResponse | null): void;
}

export interface StoreNotificationResponse {
    notification: ProtoNotification;
}

export interface GrpcCalls {
    request: any;
}

export interface AppointmentData {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    doctor: string;
    specialty: string;
    userEmail: string;
    notes?: string;
    userId: string;
    doctorId: string;
}

export interface CreateCheckoutSessionRequest {
    appointmentData: AppointmentData;
}

export interface CreateCheckoutSessionResponse {
    success: boolean;
    session_id?: string;
    checkout_url?: string;
    error?: string;
}

export interface ServiceCancelDoctorApplicationInput {
    email: string;
    reasons: string[];
}

export interface ServiceCancelDoctorApplicationOutput {
    _id: string;
    email: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
    paymentStatus: string;
    paymentAmount?: number;
    paymentLink?: string;
    updatedAt?: Date;
}

export interface WebhookEventData {
    type: string;
    data: {
        object: {
            metadata?: {
                email?: string;
                transactionId?: string;
            };
            [key: string]: any;
        };
    };
}

export interface WebhookResponse {
    success: boolean;
    message: string;
}

export interface NotificationRequest {
    email: string;
}

// Response types
export interface NotificationServiceResponse {
    notification: any;
}

export interface RescheduleRepositoryResponse {
    success: boolean;
    notification?: any;
    message?: string;
}

export interface AdminBlockRepositoryResponse {
    success: boolean;
    error?: string;
    message?: string;
}

export interface WebhookResponse {
    success: boolean;
    message: string;
}

export interface CancelDoctorApplicationInput {
    email: string;
    reasons: string[];
}

export interface CancelDoctorApplicationOutput extends INotification {
    _id: string;
}

export interface INotificationResponseData {
    id?: string;
    email: string;
    message: string;
    type: 'PAYMENT' | 'INFO' | 'ALERT';
    paymentAmount?: number;
    paymentLink?: string;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    isRead: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface INotificationsResponse {
    success: boolean;
    notification: INotificationResponseData[];
}

export interface NotificationData {
    email: string;
}

export interface RescheduleData {
    email: string;
    time: string;
}

export interface AdminBlockData {
    email: string;
    reason: string;
}

export interface RescheduleResponse {
    success: boolean;
    notification?: any;
    message?: string;
}

export interface AdminBlockResponse {
    success: boolean;
    error?: string;
    message?: string;
}

export interface PaymentStatusUpdateResponse {
    success: boolean;
}

export interface Notification {
    email: string;
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
    transactionId?: string;
    paymentCompletedAt?: Date;
}

export interface RescheduleRequest {
    email: string;
    time: string;
}

export interface AdminBlockRequest {
    email: string;
    reason: string;
}

export interface NotificationRepositoryResponse {
    notification: any;
}

export interface RescheduleRepositoryResponse {
    success: boolean;
    notification?: any;
    message?: string;
}

export interface AppointmentData {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    doctor: string;
    specialty: string;
    userEmail: string;
    notes?: string;
    userId: string;
    doctorId: string;
}

export interface StripeSessionResponse {
    success: boolean;
    sessionId: string | null;
    url: string | null;
    error?: string;
}

// export interface NotificationResponse {
//   notification: any;
// }
