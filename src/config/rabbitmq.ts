import amqp from "amqplib";

// ✅ Smart logic - detect if we're in Docker or local environment
function getRabbitUrl() {
  // Check if we're in Docker (RABBIT_URL will be set with rabbitmq service name)
  if (process.env.RABBIT_URL) {
    return process.env.RABBIT_URL;
  }
  
  // For local development outside Docker
  if (process.env.NODE_ENV === "dev" && process.env.RABBIT_URL_LOCAL) {
    return process.env.RABBIT_URL_LOCAL;
  }
  
  // Default fallback - assume Docker environment
  return "amqp://admin:admin123@rabbitmq:5672";
}

const rabbitUrl = getRabbitUrl();

// Retry configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

async function sleep(ms:any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function createRabbit(retries = 0) {
  try {
    console.log(`🔄 Connecting to RabbitMQ at: ${rabbitUrl} (attempt ${retries + 1}/${MAX_RETRIES})`);

    const conn = await amqp.connect(rabbitUrl, {
      heartbeat: 60,
      connectionTimeout: 15000, // Increased timeout
      frameMax: 8192,
      socketOptions: {
        timeout: 15000,
        noDelay: true,
        keepAlive: true,
        keepAliveDelay: 30000,
      },
    });

    conn.on("error", (err) => {
      console.error("❌ RabbitMQ connection error in config:", err);
    });

    conn.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed in config");
    });

    const ch = await conn.createChannel();

    ch.on("error", (err) => {
      console.error("❌ RabbitMQ channel error in config:", err);
    });

    ch.on("close", () => {
      console.warn("⚠️ RabbitMQ channel closed in config");
    });

    // Main exchange for all routing
    await ch.assertExchange("healNova", "topic", { durable: true });

    // User service queue for notifications from other services
    await ch.assertQueue("user.notification", { durable: true });

    // Bindings
    await ch.bindQueue("user.notification", "healNova", "user.notification");

    console.log("✅ RabbitMQ configuration initialized successfully");

    return { conn, ch };
  } catch (error) {
    console.error(`❌ Failed to create RabbitMQ connection (attempt ${retries + 1}):`, error);
    
    if (retries < MAX_RETRIES - 1) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await sleep(RETRY_DELAY);
      return createRabbit(retries + 1);
    } else {
      console.error("❌ Max retries reached. RabbitMQ connection failed permanently.");
      throw error;
    }
  }
}

// Alternative: Create a function that waits for RabbitMQ to be ready
