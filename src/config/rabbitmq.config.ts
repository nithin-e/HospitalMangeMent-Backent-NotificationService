import amqp from 'amqplib';

function getRabbitUrl() {
    if (process.env.RABBIT_URL) {
        return process.env.RABBIT_URL;
    }

    if (process.env.NODE_ENV === 'dev' && process.env.RABBIT_URL_LOCAL) {
        console.log('second one');

        return process.env.RABBIT_URL_LOCAL;
    }

    return 'amqp://admin:admin123@rabbitmq:5672';
}

const rabbitUrl = getRabbitUrl();

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;
async function sleep(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createRabbit(retries = 0) {
    try {
        console.log(
            `🔄 Connecting to RabbitMQ at: ${rabbitUrl} (attempt ${retries + 1}/${MAX_RETRIES})`
        );

        const conn = await amqp.connect(rabbitUrl, {
            heartbeat: 60,
            connectionTimeout: 15000,
            frameMax: 8192,
            socketOptions: {
                timeout: 15000,
                noDelay: true,
                keepAlive: true,
                keepAliveDelay: 30000,
            },
        });

        conn.on('error', (err) => {
            console.error('❌ RabbitMQ connection error in config:', err);
        });

        conn.on('close', () => {
            console.warn('⚠️ RabbitMQ connection closed in config');
        });

        const ch = await conn.createChannel();

        ch.on('error', (err) => {
            console.error('❌ RabbitMQ channel error in config:', err);
        });

        ch.on('close', () => {
            console.warn('⚠️ RabbitMQ channel closed in config');
        });

        await ch.assertExchange('healNova', 'topic', { durable: true });

        await ch.assertQueue('user.notification', { durable: true });

        await ch.bindQueue(
            'user.notification',
            'healNova',
            'user.notification'
        );

        console.log('✅ RabbitMQ configuration initialized successfully');

        return { conn, ch };
    } catch (error) {
        console.error(
            `❌ Failed to create RabbitMQ connection (attempt ${retries + 1}):`,
            error
        );

        if (retries < MAX_RETRIES - 1) {
            console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await sleep(RETRY_DELAY);
            return createRabbit(retries + 1);
        } else {
            console.error(
                '❌ Max retries reached. RabbitMQ connection failed permanently.'
            );
            throw error;
        }
    }
}
