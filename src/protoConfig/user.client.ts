import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import 'dotenv/config';

const packageDef = protoLoader.loadSync(
    path.resolve(__dirname, './user.proto')
);
const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as any;

const Domain = process.env.USER_GRPC_URL;
console.log(Domain);

const UserService = new grpcObject.user_package.User(
    Domain,
    grpc.credentials.createInsecure()
);

export { UserService };
