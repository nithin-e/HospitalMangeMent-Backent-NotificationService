export interface IstoreNotificationService{
    StoreNotification_Data(call:any,callback:any):Promise<any>;
    processWebhookEvent(call:any,callback:any):Promise<any>;
    rescheduleAppointment__Notification(call:any,callback:any):Promise<any>;
}