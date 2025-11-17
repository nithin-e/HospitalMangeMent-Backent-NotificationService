import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

const protoPath = path.resolve(__dirname, '../proto/user.proto');

const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as any

const Domain = process.env.USER_SERVICE_GRPC_URL;
console.log('check', Domain);

const UserService = new grpcObject.user_package.User(
    Domain,
    grpc.credentials.createInsecure()
);

export { UserService };
