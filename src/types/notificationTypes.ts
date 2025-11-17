import * as grpc from '@grpc/grpc-js';
import { ObjectId } from 'mongoose';

export interface INotificationResponse {
    success: boolean;
    notification: INotification[];
}

export interface INotification {
    id: ObjectId | string;
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

export interface IFormattedNotification {
    id?: ObjectId | string;
    user_id: string;
    message: string;
    type: number;
    is_read: boolean;
    created_at: ITimestamp | null;
    payment_amount: number;
    payment_link: string;
    payment_status: number;
}

export interface ITimestamp {
    seconds: number;
    nanos: number;
}

export interface IGrpcNotificationResponse {
    notification: IFormattedNotification[];
    success: boolean;
}

export enum NotificationType {
    TYPE_UNSPECIFIED = 0,
    INFO = 1,
    APPROVAL = 2,
    PAYMENT = 3,
    ALERT = 4,
}

export enum PaymentStatus {
    STATUS_UNSPECIFIED = 0,
    PENDING = 1,
    COMPLETED = 2,
    FAILED = 3,
}

export interface CancelDoctorApplicationData {
    email: string;
    reasons: string[];
}

export interface NotificationResponse {
    _id: string;
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



export interface GrpcCallback<T = unknown> {
    (error: grpc.ServiceError | null, response: T): void;
}
