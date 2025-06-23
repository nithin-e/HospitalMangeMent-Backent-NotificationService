export interface IstoreNotificationController {
    storeNotificationData(call: any, callback: any): Promise<any>;
    handleStripeWebhook(call: any, callback: any): Promise<any>;
    rescheduleAppointmentNotification(call: any, callback: any): Promise<any>;
}
    
