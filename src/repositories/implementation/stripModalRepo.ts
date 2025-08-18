import Stripe from "stripe";
import {  AppointmentData, StripeSessionResponse, IStripePaymentRepository } from "../interFace/stripeModalInterFace";

const convertTo12HourFormat = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
};

export default class StripePaymentRepository  implements IStripePaymentRepository {
    private stripe: Stripe;

    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }

        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-03-31.basil',
            timeout: 60000,
            maxNetworkRetries: 3,
        });
    }

    async createCheckoutSession(appointmentData: { appointmentData: AppointmentData }): Promise<StripeSessionResponse> {
        try {
            console.log('Creating Stripe checkout session with appointment data:', appointmentData);
            
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
                    doctorId: appointment.doctorId
                },
                customer_email: appointment.userEmail,
            });

            return {
                success: true,
                sessionId: session.id,
                url: session.url
            };

        } catch (error) {
            console.log('Stripe error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                sessionId: null,
                url: null
            };
        }
    }
}