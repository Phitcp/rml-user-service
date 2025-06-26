import {
  GrpcOptions,
  ClientGrpcProxy,
  ClientGrpc,
} from '@nestjs/microservices';
import { join } from 'path';
import { RBACServiceClient } from './rbac-interface';

export class RbacClient {
  private client: ClientGrpc;

  constructor() {
    const options: Required<GrpcOptions>['options'] = {
      package: 'rbac',
      protoPath: 'dist/shared-libs/utilities/rbac.proto',
      url: '0.0.0.0:4001',
    };

    this.client = new ClientGrpcProxy(options);
  }

  getRbacService(): RBACServiceClient {
    return this.client.getService('RBACService');
  }
}
