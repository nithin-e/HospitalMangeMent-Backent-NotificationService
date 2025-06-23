export interface IstoreNotificationRepository{
    storingNotification_Datas(call:any,callback:any):Promise<any>;
    reschedule_Appointment__Notification(call:any,callback:any):Promise<any>;
    
}