import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface INotification extends Document {
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

const NotificationSchema: Schema = new Schema({
    
    email: {
        type: String,
        required: true,
        index: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['PAYMENT', 'INFO', 'ALERT'],
        default: 'INFO',
    },
    paymentAmount: {
        type: Number,
    },
    paymentLink: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
});

export const NotificationModel = mongoose.model<INotification>(
    'Notification',
    NotificationSchema
);
