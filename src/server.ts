import "dotenv/config";
import connectDB from "./config/mongo";
import express from "express";
import { startGrpcServer } from "./grpc/server";

import { Consumer } from "./event/consumer";
import { StoreNotificationController } from "./app";

(async () => {
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("✅ MongoDB connected in Notification service");

  // Start event consumer
  const consumer = new Consumer(StoreNotificationController);
  await consumer.start();

  // Start gRPC server
  startGrpcServer();
})();
