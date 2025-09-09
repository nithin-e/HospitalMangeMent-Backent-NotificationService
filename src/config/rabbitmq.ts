// config/rabbitmq.ts - Notification Service
import amqp from 'amqplib';

const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost:5672';

export async function createRabbit() {
  try {
    console.log('🔄 Connecting to RabbitMQ at:', RABBIT_URL);
    
    const conn = await amqp.connect(RABBIT_URL, {
      heartbeat: 60,
      connectionTimeout: 10000,
      frameMax: 8192, 
      socketOptions: {
        timeout: 10000,
        noDelay: true,
        keepAlive: true,
        keepAliveDelay: 30000
      }
    });

    // Add connection error handlers
    conn.on('error', (err) => {
      console.error('❌ RabbitMQ connection error in config:', err);
    });

    conn.on('close', () => {
      console.warn('⚠️ RabbitMQ connection closed in config');
    });

    const ch = await conn.createChannel();

    // Add channel error handlers
    ch.on('error', (err) => {
      console.error('❌ RabbitMQ channel error in config:', err);
    });

    ch.on('close', () => {
      console.warn('⚠️ RabbitMQ channel closed in config');
    });

    // Main exchange for all routing
    await ch.assertExchange('healNova', 'topic', { durable: true });

    // User service queue for notifications from other services
    await ch.assertQueue('user.notification', { durable: true });

    // Bindings
    await ch.bindQueue('user.notification', 'healNova', 'user.notification');

    console.log('✅ RabbitMQ configuration initialized successfully');

    return { conn, ch };
  } catch (error) {
    console.error('❌ Failed to create RabbitMQ connection:', error);
    throw error;
  }
}