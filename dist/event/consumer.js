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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = void 0;
const rabbitmq_1 = require("../config/rabbitmq");
class Consumer {
    constructor(StoreNotificationController) {
        this.StoreNotificationController = StoreNotificationController;
        this.isRunning = false;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRunning) {
                console.log('⚠️ Consumer is already running');
                return;
            }
            try {
                const { conn, ch } = yield (0, rabbitmq_1.createRabbit)();
                this.ch = ch;
                this.conn = conn;
                this.isRunning = true;
                console.log("🚀 Realtime service started with RabbitMQ consumers");
                yield ch.prefetch(1);
                yield ch.consume("user.notification", (msg) => __awaiter(this, void 0, void 0, function* () {
                    if (!msg)
                        return;
                    try {
                        console.log('📨 Received message from user.notification queue');
                        const eventData = JSON.parse(msg.content.toString());
                        yield this.StoreNotificationController.handleStripeWebhook(eventData);
                        ch.ack(msg);
                        console.log('✅ Message processed successfully');
                    }
                    catch (err) {
                        console.error("❌ Message processing error:", err);
                        // Reject message without requeue to avoid infinite loops
                        ch.nack(msg, false, false);
                    }
                }), {
                    noAck: false // Ensure manual acknowledgment
                });
                // Handle connection events
                this.conn.on('error', (err) => {
                    console.error('❌ Consumer connection error:', err);
                    this.isRunning = false;
                });
                this.conn.on('close', () => {
                    console.warn('⚠️ Consumer connection closed');
                    this.isRunning = false;
                });
                this.ch.on('error', (err) => {
                    console.error('❌ Consumer channel error:', err);
                });
                this.ch.on('close', () => {
                    console.warn('⚠️ Consumer channel closed');
                });
            }
            catch (error) {
                console.error('❌ Failed to start consumer:', error);
                this.isRunning = false;
                throw error;
            }
        });
    }
    // Graceful shutdown
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.isRunning = false;
                if (this.ch) {
                    yield this.ch.close();
                    console.log("✅ RabbitMQ channel closed");
                }
                if (this.conn) {
                    yield this.conn.close();
                    console.log("✅ RabbitMQ connection closed");
                }
            }
            catch (error) {
                console.error("❌ Error stopping realtime service:", error);
            }
        });
    }
    isConsumerRunning() {
        return this.isRunning;
    }
}
exports.Consumer = Consumer;
