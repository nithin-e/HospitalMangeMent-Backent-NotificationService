import * as grpc from '@grpc/grpc-js';

export class GrpcErrorHandler {
    static invalidArgument(message: string) {
        return {
            code: grpc.status.INVALID_ARGUMENT,
            message,
        };
    }

    static internal(error: unknown) {
        return {
            code: grpc.status.INTERNAL,
            message: (error as Error).message || 'Internal server error',
        };
    }
}
