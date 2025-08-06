import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class CreateCharacterFailed extends RpcException {
  constructor(
    errObject = {
      errorCode: status.INTERNAL,
      details: 'Failed to Create character',
    },
  ) {
    super({
      error: errObject.errorCode || status.INTERNAL,
      details: errObject.details || 'Failed to Create character',
    });
  }
}

export class ReceivedExpFailed extends RpcException {
  constructor(
    errObject = {
      errorCode: status.PERMISSION_DENIED,
      details: 'Failed to receive experience',
    },
  ) {
    super({
      error: errObject.errorCode || status.PERMISSION_DENIED,
      details: errObject.details || 'Failed to receive experience',
    });
  }
}