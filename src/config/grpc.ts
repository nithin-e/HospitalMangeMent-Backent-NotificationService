import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

export const loadProto = () => {
  const protoPath = path.resolve(__dirname, "../proto/Notification.proto");

  const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDef) as any;
};

export const createGrpcServer = () => {
  return new grpc.Server({
    "grpc.max_send_message_length": 10 * 1024 * 1024,
    "grpc.max_receive_message_length": 10 * 1024 * 1024,
  });
};
