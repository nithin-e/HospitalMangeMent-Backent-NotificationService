export interface Timestamp {
    seconds: number;
    nanos: number;
  }
  
  export interface NotificationItem {
    id?: string;
    user_id?: string;
    email?: string;  // Added email field to match repository query
    message?: string;
    type?: number;
    is_read?: boolean;
    created_at?: Timestamp | null;
    payment_amount?: number;
    payment_link?: string;
    payment_status?: number;
  }
  
  export interface NotificationResponse {
    notification: NotificationItem[];
    success: boolean;
  }