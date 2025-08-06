import { ExpService } from './../service/exp.service';
import { ExpAdminService } from '../service/exp-admin.service';
// rbac.controller.ts
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';
import { GRPCExceptionFilter } from '@shared/exception-filter/grpc-exception-filter';

import { getContext } from '@shared/decorator/context.decorator';
import { Metadata } from '@grpc/grpc-js';
import {
  CreateExpResourceRequest,
  CreateExpResourceResponse,
  ExpServiceController,
  ValidateExpResourceRequest,
  ValidateExpResourceResponse,
} from '@root/interface/exp.proto.interface';
@UseInterceptors(GrpcLogInterceptor)
@UseFilters(GRPCExceptionFilter)
@Controller()
export class ExpController implements ExpServiceController {
  constructor(
    private readonly expAdminService: ExpAdminService,
    private readonly expService: ExpService,
  ) {}

  // #region admin methods
  @GrpcMethod('ExpService', 'CreateExpResource')
  createExpResource(
    data: CreateExpResourceRequest,
    metadata: Metadata,
  ): Promise<CreateExpResourceResponse> {
    return this.expAdminService.createExpResource(getContext(metadata), data);
  }

  @GrpcMethod('ExpService', 'ValidateExpResource')
  validateExpResource(
    data: ValidateExpResourceRequest,
    metadata: Metadata,
  ): Promise<ValidateExpResourceResponse> {
    return this.expService.validateExpResource(getContext(metadata), data);
  }
  // #endregion admin methods

  // #region user methods
  // Add user methods here if needed
  // #endregion user methods
}
