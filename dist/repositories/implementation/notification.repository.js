"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const mongoose_1 = require("mongoose");
const stripe_1 = __importDefault(require("stripe"));
const https_1 = __importDefault(require("https"));
const notification_schema_1 = require("../../entities/notification.schema");
const base_repository_1 = require("./base.repository");
const inversify_1 = require("inversify");
const enumsConverter_1 = require("../../utility/enumsConverter");
const messages_constant_1 = require("../../constants/messages.constant");
let NotificationRepository = class NotificationRepository extends base_repository_1.BaseRepository {
    constructor(model) {
        super(model || notification_schema_1.NotificationModel);
        this.handleCancelDoctorApplication = async (data) => {
            try {
                const rejectionMessage = data.reasons.length > 0
                    ? `${messages_constant_1.NOTIFICATION_MESSAGES.CREATE.DOCTOR_REJECTION_WITH_REASONS}: ${data.reasons.join(', ')}`
                    : messages_constant_1.NOTIFICATION_MESSAGES.CREATE.DOCTOR_REJECTION;
                const newNotification = {
                    email: data.email,
                    message: rejectionMessage,
                    type: 'ALERT',
                    isRead: false,
                    createdAt: new Date(),
                    paymentStatus: 'PENDING',
                };
                const savedNotification = await notification_schema_1.NotificationModel.create(newNotification);
                return savedNotification.toObject();
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.CREATE_FAILED, error);
                throw error;
            }
        };
        this.storeNotificationData = async (data) => {
            try {
                const message = 'Your application has been approved! Please complete the payment to join our medical team.';
                const paymentAmount = 10000;
                const transactionId = `tx_${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2, 15)}`;
                const paymentLink = await this.createStripePaymentLink(data.email, paymentAmount, transactionId);
                const notification = await notification_schema_1.NotificationModel.create({
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
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
                throw error;
            }
        };
        this.createStripePaymentLink = async (email, amount, transactionId) => {
            try {
                if (!process.env.FRONTEND_URL) {
                    throw new Error(messages_constant_1.NOTIFICATION_MESSAGES.STRIPE.FRONTEND_URL_MISSING);
                }
                const createWithRetry = async (fn, retries = 3, delay = 1000) => {
                    try {
                        return await fn();
                    }
                    catch (error) {
                        if (retries <= 0)
                            throw error;
                        await new Promise((resolve) => setTimeout(resolve, delay));
                        return createWithRetry(fn, retries - 1, delay * 2);
                    }
                };
                const productName = `Doctor Registration Fee - ${transactionId}`;
                const product = await createWithRetry(() => this.stripe.products.create({
                    name: productName,
                    description: 'One-time fee to join our medical team',
                    metadata: {
                        email,
                        transactionId,
                        created: new Date().toISOString(),
                    },
                }));
                const price = await createWithRetry(() => this.stripe.prices.create({
                    unit_amount: amount,
                    currency: 'usd',
                    product: product.id,
                    metadata: { transactionId },
                }));
                // Construct the redirect URL
                const redirectUrl = `https://www.healnova.fun/payment-success?email=${encodeURIComponent(email)}&transaction=${transactionId}`;
                const paymentLinkParams = {
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
                const paymentLink = await createWithRetry(() => this.stripe.paymentLinks.create(paymentLinkParams));
                return paymentLink;
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.PAYMENT_LINK_FAILED, error);
                throw error;
            }
        };
        this.rescheduleAppointmentNotification = async (data) => {
            try {
                const notificationMessage = `Your appointment has been rescheduled to ${data.time}. Sorry for the inconvenience.`;
                const newNotification = new notification_schema_1.NotificationModel({
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
                    message: messages_constant_1.NOTIFICATION_MESSAGES.CREATE.RESCHEDULE_SUCCESS,
                };
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
                throw error;
            }
        };
        this.createAdminBlockNotification = async (data) => {
            try {
                const newNotification = new notification_schema_1.NotificationModel({
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
            }
            catch (error) {
                console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.STORE_FAILED, error);
                return {
                    success: false,
                    error: error instanceof Error
                        ? error.message
                        : messages_constant_1.NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR,
                    message: messages_constant_1.NOTIFICATION_MESSAGES.ADMIN_BLOCK.FAILED,
                };
            }
        };
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error(messages_constant_1.NOTIFICATION_MESSAGES.STRIPE.KEY_MISSING);
        }
        const httpsAgent = new https_1.default.Agent({
            timeout: 60000,
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 5,
        });
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-03-31.basil',
            httpAgent: httpsAgent,
            timeout: 60000,
            maxNetworkRetries: 3,
        });
    }
    async fetchNotifications(email) {
        try {
            const notifications = await this.findOne({ email });
            if (!notifications) {
                return {
                    success: false,
                    notification: [],
                };
            }
            const notificationData = {
                id: notifications._id.toString(),
                email: notifications.email,
                message: notifications.message,
                type: notifications.type,
                paymentAmount: notifications.paymentAmount,
                paymentLink: notifications.paymentLink,
                paymentStatus: notifications.paymentStatus,
                isRead: notifications.isRead,
                createdAt: notifications.createdAt,
                updatedAt: notifications.updatedAt,
            };
            return {
                success: true,
                notification: [notificationData],
            };
        }
        catch (error) {
            console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.REPOSITORY_LAYER_ERROR, error);
            throw error;
        }
    }
    async updatePaymentStatus(email, status, transactionId) {
        try {
            const query = {
                email,
                paymentStatus: 'PENDING',
            };
            if (transactionId) {
                query.transactionId = transactionId;
            }
            const result = await notification_schema_1.NotificationModel.updateOne(query, {
                $set: {
                    paymentStatus: status,
                    paymentCompletedAt: new Date(),
                },
            });
            await notification_schema_1.NotificationModel.deleteMany({ email });
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.error(messages_constant_1.NOTIFICATION_MESSAGES.ERROR.PAYMENT_STATUS_FAILED, error);
            throw error;
        }
    }
    async createCheckoutSession(appointmentData) {
        try {
            const { appointmentData: appointment } = appointmentData;
            const formattedTime = (0, enumsConverter_1.convertTo12HourFormat)(appointment.time);
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
        }
        catch (error) {
            console.error(messages_constant_1.NOTIFICATION_MESSAGES.STRIPE.ERROR, error);
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : messages_constant_1.NOTIFICATION_MESSAGES.ERROR.UNKNOWN_ERROR,
                sessionId: null,
                url: null,
            };
        }
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.unmanaged)()),
    __metadata("design:paramtypes", [mongoose_1.Model])
], NotificationRepository);
