"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRabbit = createRabbit;
// config/rabbitmq.ts - Notification Service
const amqplib_1 = __importDefault(require("amqplib"));
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost:5672';
function createRabbit() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔄 Connecting to RabbitMQ at:', RABBIT_URL);
            const conn = yield amqplib_1.default.connect(RABBIT_URL, {
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
            const ch = yield conn.createChannel();
            // Add channel error handlers
            ch.on('error', (err) => {
                console.error('❌ RabbitMQ channel error in config:', err);
            });
            ch.on('close', () => {
                console.warn('⚠️ RabbitMQ channel closed in config');
            });
            // Main exchange for all routing
            yield ch.assertExchange('healNova', 'topic', { durable: true });
            // User service queue for notifications from other services
            yield ch.assertQueue('user.notification', { durable: true });
            // Bindings
            yield ch.bindQueue('user.notification', 'healNova', 'user.notification');
            console.log('✅ RabbitMQ configuration initialized successfully');
            return { conn, ch };
        }
        catch (error) {
            console.error('❌ Failed to create RabbitMQ connection:', error);
            throw error;
        }
    });
}
