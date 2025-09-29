import { createRabbit } from '../config/rabbitmq.config';
import StoreNotificationController from '../controllers/storeNotificationController';

export class Consumer {
    ch: any;
    conn: any;
    private isRunning: boolean = false;

    constructor(
        private StoreNotificationController: StoreNotificationController
    ) {}

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

            await ch.prefetch(1);

            await ch.consume(
                'user.notification',
                async (msg) => {
                    if (!msg) return;

                    try {
                        console.log(
                            '📨 Received message from user.notification queue'
                        );
                        const eventData = JSON.parse(msg.content.toString());

                        await this.StoreNotificationController.handleStripeWebhook(
                            eventData
                        );

                        ch.ack(msg);
                        console.log('✅ Message processed successfully');
                    } catch (err) {
                        console.error('❌ Message processing error:', err);
                        ch.nack(msg, false, false);
                    }
                },
                {
                    noAck: false,
                }
            );

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

            this.ch.on('close', () => {
                console.warn('⚠️ Consumer channel closed');
            });
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
            console.error('❌ Error stopping realtime service:', error);
        }
    }

    isConsumerRunning(): boolean {
        return this.isRunning;
    }
}
