import Stripe from "stripe";

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

export interface IHandlingStripPaymentRepository {
    HandlingCreateCheckout_Session(appointmentData: { appointmentData: AppointmentData }): Promise<StripeSessionResponse>;
}