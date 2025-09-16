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
const convertTo12HourFormat = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
};
class StripePaymentRepository {
    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-03-31.basil',
            timeout: 60000,
            maxNetworkRetries: 3,
        });
    }
    createCheckoutSession(appointmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Creating Stripe checkout session with appointment data:', appointmentData);
                const { appointmentData: appointment } = appointmentData;
                const formattedTime = convertTo12HourFormat(appointment.time);
                const session = yield this.stripe.checkout.sessions.create({
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
                        doctorId: appointment.doctorId
                    },
                    customer_email: appointment.userEmail,
                });
                return {
                    success: true,
                    sessionId: session.id,
                    url: session.url
                };
            }
            catch (error) {
                console.log('Stripe error:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    sessionId: null,
                    url: null
                };
            }
        });
    }
}
exports.default = StripePaymentRepository;
