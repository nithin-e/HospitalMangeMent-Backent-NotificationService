import {  Model, FilterQuery, Types } from 'mongoose';
import Stripe from 'stripe';
import https from 'https';
import {
    INotification,
    NotificationModel,
} from '../../entities/notification.schema';
import { BaseRepository } from './base.repository';

import { injectable, unmanaged } from 'inversify';
import {
    INotificationsResponse,
    CancelDoctorApplicationInput,
    CancelDoctorApplicationOutput,
    NotificationData,
    NotificationRepositoryResponse,
    RescheduleData,
    RescheduleResponse,
    AdminBlockData,
    AdminBlockResponse,
    AppointmentData,
    StripeSessionResponse,
} from 'src/types/types';
import { convertTo12HourFormat } from '../../utility/enumsConverter';
import { INotificationRepository } from '../interFace/INotification.repository';
import { NOTIFICATION_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class NotificationRepository
    extends BaseRepository<INotification>
    implements INotificationRepository
{
    private stripe: Stripe;
    constructor(@unmanaged() model?: Model<INotification>) {
        super(model || NotificationModel);

        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error(NOTIFICATION_MESSAGES.STRIPE.KEY_MISSING);
        }

        const httpsAgent = new https.Agent({
            timeout: 60000,
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 5,
        });

        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-03-31.basil',
            httpAgent: httpsAgent,
            timeout: 60000,
            maxNetworkRetries: 3,
        });
    }

    async fetchNotifications(email: string): Promise<INotificationsResponse> {
        try {
            const notifications = await this.find({ email });

            if (!notifications) {
                return {
                    success: false,
                    notification: [],
                };
            }

        const notificationData = notifications.map((n) => ({
          id: (n._id as Types.ObjectId).toString(),
            email: n.email,
            message: n.message,
            type: n.type,
            paymentAmount: n.paymentAmount,
            paymentLink: n.paymentLink,
            paymentStatus: n.paymentStatus,
            isRead: n.isRead,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
        }));

            console.log(
                '..........check this notications of the use inside the repository..........',
                notificationData
            );

          return {
                success: true,
                notification: notificationData,
            };
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.REPOSITORY_LAYER_ERROR,
                error
            );
            throw error;
        }
    }

    handleCancelDoctorApplication = async (
        data: CancelDoctorApplicationInput
    ): Promise<CancelDoctorApplicationOutput> => {
        try {
            const rejectionMessage =
                data.reasons.length > 0
                    ? `${NOTIFICATION_MESSAGES.CREATE.DOCTOR_REJECTION_WITH_REASONS}: ${data.reasons.join(', ')}`
                    : NOTIFICATION_MESSAGES.CREATE.DOCTOR_REJECTION;

            const newNotification = {
                email: data.email,
                message: rejectionMessage,
                type: 'ALERT' as const,
                isRead: false,
                createdAt: new Date(),
                paymentStatus: 'PENDING' as const,
            };

            const savedNotification =
                await NotificationModel.create(newNotification);

            return savedNotification.toObject() as CancelDoctorApplicationOutput;
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.CREATE_FAILED, error);

            throw error;
        }
    };

    storeNotificationData = async (
        data: NotificationData
    ): Promise<NotificationRepositoryResponse> => {
        try {
            const message =
                'Your application has been approved! Please complete the payment to join our medical team.';
            const paymentAmount = 10000;
            const transactionId = `tx_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 15)}`;

            const paymentLink = await this.createStripePaymentLink(
                data.email,
                paymentAmount,
                transactionId
            );

            const notification = await NotificationModel.create({
                email: data.email,
                message: message,
                type: 'PAYMENT',
                paymentAmount: paymentAmount,
                paymentLink: paymentLink.url,
                paymentStatus: 'PENDING',
                transactionId: transactionId,
                isRead: false,
                createdAt: new Date(),
            });

            return { notification };
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
            throw error;
        }
    };

    private createStripePaymentLink = async (
        email: string,
        amount: number,
        transactionId: string
    ): Promise<Stripe.PaymentLink> => {
        try {
            if (!process.env.FRONTEND_URL) {
                throw new Error(
                    NOTIFICATION_MESSAGES.STRIPE.FRONTEND_URL_MISSING
                );
            }

            const createWithRetry = async <T>(
                fn: () => Promise<T>,
                retries = 3,
                delay = 1000
            ): Promise<T> => {
                try {
                    return await fn();
                } catch (error) {
                    if (retries <= 0) throw error;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return createWithRetry(fn, retries - 1, delay * 2);
                }
            };

            const productName = `Doctor Registration Fee - ${transactionId}`;

            const product = await createWithRetry(() =>
                this.stripe.products.create({
                    name: productName,
                    description: 'One-time fee to join our medical team',
                    metadata: {
                        email,
                        transactionId,
                        created: new Date().toISOString(),
                    },
                })
            );

            const price = await createWithRetry(() =>
                this.stripe.prices.create({
                    unit_amount: amount,
                    currency: 'usd',
                    product: product.id,
                    metadata: { transactionId },
                })
            );

            // Construct the redirect URL
            const redirectUrl = `https://www.healnova.fun/payment-success?email=${encodeURIComponent(
                email
            )}&transaction=${transactionId}`;

            const paymentLinkParams: any = {
                line_items: [{ price: price.id, quantity: 1 }],
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        url: redirectUrl,
                    },
                },
                metadata: {
                    email,
                    purpose: 'doctor_registration',
                    createdAt: new Date().toISOString(),
                    transactionId,
                    uniqueId: `${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 10)}`,
                },
                automatic_tax: { enabled: false },
            };

            const paymentLink = await createWithRetry(() =>
                this.stripe.paymentLinks.create(paymentLinkParams)
            );

            return paymentLink;
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.PAYMENT_LINK_FAILED,
                error
            );
            throw error;
        }
    };

    async updatePaymentStatus(
        email: string,
        status: string,
        transactionId?: string
    ): Promise<boolean> {
        try {
            const query: FilterQuery<Notification> = {
                email,
                paymentStatus: 'PENDING',
            };

            if (transactionId) {
                query.transactionId = transactionId;
            }

            const result = await NotificationModel.updateOne(query, {
                $set: {
                    paymentStatus: status,
                    paymentCompletedAt: new Date(),
                },
            });
            await NotificationModel.deleteMany({ email });
            return result.modifiedCount > 0;
        } catch (error) {
            console.error(
                NOTIFICATION_MESSAGES.ERROR.PAYMENT_STATUS_FAILED,
                error
            );
            throw error;
        }
    }

    rescheduleAppointmentNotification = async (
        data: RescheduleData
    ): Promise<RescheduleResponse> => {
        try {
            const notificationMessage = `Your appointment has been rescheduled to ${data.time}. Sorry for the inconvenience.`;

            const newNotification = new NotificationModel({
                email: data.email,
                message: notificationMessage,
                type: 'INFO',
                isRead: false,
                createdAt: new Date(),
                paymentStatus: 'PENDING',
            });

            const savedNotification = await newNotification.save();

            return {
                success: true,
                notification: savedNotification,
                message: NOTIFICATION_MESSAGES.CREATE.RESCHEDULE_SUCCESS,
            };
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
            throw error;
        }
    };

    createAdminBlockNotification = async (
        data: AdminBlockData
    ): Promise<AdminBlockResponse> => {
        try {
            const newNotification = new NotificationModel({
                email: data.email,
                message: data.reason,
                type: 'ALERT',
                isRead: false,
                paymentStatus: 'PENDING',
                createdAt: new Date(),
            });

            await newNotification.save();

            return {
                success: true,
            };
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR,
                message: NOTIFICATION_MESSAGES.ADMIN_BLOCK.FAILED,
            };
        }
    };

    async createCheckoutSession(appointmentData: {
        appointmentData: AppointmentData;
    }): Promise<StripeSessionResponse> {
        try {
            const { appointmentData: appointment } = appointmentData;
            const formattedTime = convertTo12HourFormat(appointment.time);

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: `Appointment with ${appointment.doctor}`,
                                description: `${appointment.specialty} - ${appointment.date} at ${formattedTime}`,
                            },
                            unit_amount: 50000,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/success`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`,
                metadata: {
                    type: 'appointment',
                    patientName: appointment.name,
                    patientEmail: appointment.email,
                    patientPhone: appointment.phone,
                    appointmentDate: appointment.date,
                    appointmentTime: appointment.time,
                    doctorName: appointment.doctor,
                    specialty: appointment.specialty,
                    userEmail: appointment.userEmail,
                    notes: appointment.notes || '',
                    patientId: appointment.userId,
                    doctorId: appointment.doctorId,
                },
                customer_email: appointment.userEmail,
            });

            return {
                success: true,
                sessionId: session.id,
                url: session.url,
            };
        } catch (error) {
            console.error(NOTIFICATION_MESSAGES.STRIPE.ERROR, error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR,
                sessionId: null,
                url: null,
            };
        }
    }
}
