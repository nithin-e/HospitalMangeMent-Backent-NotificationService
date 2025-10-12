import { createRabbit } from '../config/rabbitmq.config';
import { NotificationController } from '../controllers/notification.controller';

export class Consumer {
  ch: any;
  conn: any;
  private isRunning: boolean = false;

  constructor(private storeNotificationController: NotificationController) {}

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Consumer is already running');
      return;
    }

    try {
      const { conn, ch } = await createRabbit();
      this.ch = ch;
      this.conn = conn;
      this.isRunning = true;

      console.log('🚀 Realtime service started with RabbitMQ consumers');

      // Limit to 1 message at a time
      await ch.prefetch(1);

      const appointmentQueue = 'appointment.rescheduled';
      const userQueue = 'user.notification';

     
      await ch.assertQueue(appointmentQueue, { durable: true });
      await ch.bindQueue(appointmentQueue, 'healNova', appointmentQueue);

      await ch.assertQueue(userQueue, { durable: true });
      await ch.bindQueue(userQueue, 'healNova', userQueue);

      await ch.consume(
        appointmentQueue,
        async (msg) => {
          if (!msg) return;

          try {
            console.log('📨 Received message from appointment.rescheduled queue');
            const rescheduleData = JSON.parse(msg.content.toString());

            // Call your notification handler
            await this.storeNotificationController.rescheduleAppointmentNotification(
              rescheduleData.patientEmail,
              rescheduleData.newSlot.time12 
            );

            ch.ack(msg);
            console.log('✅ Appointment reschedule notification processed successfully');
          } catch (err) {
            console.error('❌ Appointment processing error:', err);
            ch.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      // ===== User Notification Queue Consumer =====
      await ch.consume(
        userQueue,
        async (msg) => {
          if (!msg) return;

          try {
            console.log('📨 Received message from user.notification queue');
            const eventData = JSON.parse(msg.content.toString());

            // Call your notification handler
            await this.storeNotificationController.handleStripeWebhook(eventData);

            ch.ack(msg);
            console.log('✅ User notification processed successfully');
          } catch (err) {
            console.error('❌ User notification processing error:', err);
            ch.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      // ===== Connection & channel event handlers =====
      this.conn.on('error', (err: Error) => {
        console.error('❌ Consumer connection error:', err);
        this.isRunning = false;
      });

      this.conn.on('close', () => {
        console.warn('⚠️ Consumer connection closed');
        this.isRunning = false;
      });

      this.ch.on('error', (err: Error) => {
        console.error('❌ Consumer channel error:', err);
      });

      this.ch.on('close', () => console.warn('⚠️ Consumer channel closed'));
    } catch (error) {
      console.error('❌ Failed to start consumer:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop() {
    try {
      this.isRunning = false;

      if (this.ch) {
        await this.ch.close();
        console.log('✅ RabbitMQ channel closed');
      }

      if (this.conn) {
        await this.conn.close();
        console.log('✅ RabbitMQ connection closed');
      }
    } catch (error) {
      console.error('❌ Error stopping consumer:', error);
    }
  }

  isConsumerRunning(): boolean {
    return this.isRunning;
  }
}
