"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const notification_Schema_1 = require("../../entities/notification_Schema");
const https_1 = __importDefault(require("https"));
class StoreNotificationRepository {
    constructor() {
        this.storeNotificationData = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message = "Your application has been approved! Please complete the payment to join our medical team.";
                const paymentAmount = 10000;
                const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                const paymentLink = yield this.createStripePaymentLink(data.email, paymentAmount, transactionId);
                const notification = yield notification_Schema_1.NotificationModel.create({
                    email: data.email,
                    message: message,
                    type: 'PAYMENT',
                    paymentAmount: paymentAmount,
                    paymentLink: paymentLink.url,
                    paymentStatus: 'PENDING',
                    transactionId: transactionId,
                    isRead: false,
                    createdAt: new Date()
                });
                return { notification };
            }
            catch (error) {
                console.error("Error in storing notification data:", error);
                throw error;
            }
        });
        this.createStripePaymentLink = (email, amount, transactionId) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!process.env.FRONTEND_URL) {
                    throw new Error('FRONTEND_URL is not defined in environment variables');
                }
                const createWithRetry = (fn_1, ...args_1) => __awaiter(this, [fn_1, ...args_1], void 0, function* (fn, retries = 3, delay = 1000) {
                    try {
                        return yield fn();
                    }
                    catch (error) {
                        if (retries <= 0)
                            throw error;
                        yield new Promise(resolve => setTimeout(resolve, delay));
                        return createWithRetry(fn, retries - 1, delay * 2);
                    }
                });
                const productName = `Doctor Registration Fee - ${transactionId}`;
                const product = yield createWithRetry(() => this.stripe.products.create({
                    name: productName,
                    description: 'One-time fee to join our medical team',
                    metadata: { email, transactionId, created: new Date().toISOString() }
                }));
                const price = yield createWithRetry(() => this.stripe.prices.create({
                    unit_amount: amount,
                    currency: 'usd',
                    product: product.id,
                    metadata: { transactionId }
                }));
                const paymentLinkParams = {
                    line_items: [{ price: price.id, quantity: 1 }],
                    after_completion: {
                        type: 'redirect',
                        redirect: {
                            url: `${process.env.FRONTEND_URL}/payment-success?email=${encodeURIComponent(email)}&transaction=${transactionId}`,
                        },
                    },
                    metadata: {
                        email,
                        purpose: 'doctor_registration',
                        createdAt: new Date().toISOString(),
                        transactionId,
                        uniqueId: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
                    },
                    automatic_tax: { enabled: false }
                };
                if (process.env.NODE_ENV === 'development' && email) {
                    const testEmail = email.replace('@', `+${Math.floor(Math.random() * 10000)}@`);
                    paymentLinkParams.prefilled_email = testEmail;
                }
                const paymentLink = yield createWithRetry(() => this.stripe.paymentLinks.create(paymentLinkParams));
                return paymentLink;
            }
            catch (error) {
                console.error("Error creating Stripe payment link:", error);
                throw error;
            }
        });
        this.rescheduleAppointmentNotification = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationMessage = `Your appointment has been rescheduled to ${data.time}. Sorry for the inconvenience.`;
                const newNotification = new notification_Schema_1.NotificationModel({
                    email: data.email,
                    message: notificationMessage,
                    type: 'INFO',
                    isRead: false,
                    createdAt: new Date(),
                    paymentStatus: 'PENDING'
                });
                const savedNotification = yield newNotification.save();
                return {
                    success: true,
                    notification: savedNotification,
                    message: 'Reschedule notification created successfully'
                };
            }
            catch (error) {
                console.error("Error in storing notification data:", error);
                throw error;
            }
        });
        this.createAdminBlockNotification = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newNotification = new notification_Schema_1.NotificationModel({
                    email: data.email,
                    message: data.reason,
                    type: 'ALERT',
                    isRead: false,
                    paymentStatus: 'PENDING',
                    createdAt: new Date(),
                });
                yield newNotification.save();
                return {
                    success: true
                };
            }
            catch (error) {
                console.error("Error in storing notification data:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error occurred',
                    message: 'Failed to create notification'
                };
            }
        });
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
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
    updatePaymentStatus(email, status, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { email, paymentStatus: 'PENDING' };
                if (transactionId) {
                    query.transactionId = transactionId;
                }
                const result = yield notification_Schema_1.NotificationModel.updateOne(query, {
                    $set: {
                        paymentStatus: status,
                        paymentCompletedAt: new Date()
                    }
                });
                yield notification_Schema_1.NotificationModel.deleteMany({ email });
                return result.modifiedCount > 0;
            }
            catch (error) {
                console.error('Error updating payment status:', error);
                throw error;
            }
        });
    }
}
exports.default = StoreNotificationRepository;
