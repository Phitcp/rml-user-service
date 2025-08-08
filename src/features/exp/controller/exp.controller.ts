import { ExpService } from './../service/exp.service';
import { ExpAdminService } from '../service/exp-admin.service';
// rbac.controller.ts
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';
import { GRPCExceptionFilter } from '@shared/exception-filter/grpc-exception-filter';

import { getContext } from '@shared/decorator/context.decorator';
import { Metadata } from '@grpc/grpc-js';
import {
  ClaimExpRequest,
  CreateExpResourceRequest,
  CreateExpResourceResponse,
  ExpServiceController,
  ValidateExpResourceRequest,
  ValidateExpResourceResponse,
} from '@root/interface/exp.proto.interface';
// import { Observable, Subject } from 'rxjs';

export class ExpClaimedEvent {
  constructor(
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly expAmount: number,
    public readonly resourceType: string,
    public readonly slugId: string,
    public readonly claimId: string,
  ) {}
}

export class UserLevelUpEvent {
  constructor(
    public readonly userId: string,
    public readonly oldLevel: number,
    public readonly newLevel: number,
    public readonly totalExp: number,
  ) {}
}

@UseInterceptors(GrpcLogInterceptor)
@UseFilters(GRPCExceptionFilter)
@Controller()
export class ExpController implements ExpServiceController {
  // private eventStream = new Subject<any>();

  constructor(
    private readonly expAdminService: ExpAdminService,
    private readonly expService: ExpService,
  ) {
    // this.setupEventStreamListeners();
  }

  // #region admin methods
  @GrpcMethod('ExpService', 'CreateExpResource')
  createExpResource(
    data: CreateExpResourceRequest,
    metadata: Metadata,
  ): Promise<CreateExpResourceResponse> {
    return this.expAdminService.createExpResource(getContext(metadata), data);
  }
  // #endregion admin methods

  // #region user methods

  @GrpcMethod('ExpService', 'ValidateExpResource')
  validateExpResource(
    data: ValidateExpResourceRequest,
    metadata: Metadata,
  ): Promise<ValidateExpResourceResponse> {
    return this.expService.validateExpResource(getContext(metadata), data);
  }
  // #endregion user methods

  @GrpcMethod('ExpService', 'ClaimExp')
  claimExp(
    data: ClaimExpRequest,
    metadata: Metadata,
  ): Promise<void> {
    return this.expService.claimExp(getContext(metadata), data);
  }
  // #region exp observable
  // @GrpcStreamMethod('ExpService', 'StreamExpEvents')
  // streamExpEvents(): Observable<any> {
  //   return this.eventStream.asObservable();
  // }

  // private setupEventStreamListeners() {
  //   // Listen to internal events and stream them via gRPC
  //   this.eventEmitter.on('exp.claimed', (event: ExpClaimedEvent) => {
  //     this.eventStream.next({
  //       eventType: 'exp.claimed',
  //       userId: event.userId,
  //       payload: JSON.stringify({
  //         resourceId: event.resourceId,
  //         expAmount: event.expAmount,
  //         resourceType: event.resourceType,
  //         claimId: event.claimId,
  //       }),
  //       timestamp: new Date().toISOString(),
  //     });
  //   });

  //   this.eventEmitter.on('user.level.up', (event: UserLevelUpEvent) => {
  //     this.eventStream.next({
  //       eventType: 'user.level.up',
  //       userId: event.userId,
  //       payload: JSON.stringify({
  //         oldLevel: event.oldLevel,
  //         newLevel: event.newLevel,
  //         totalExp: event.totalExp,
  //       }),
  //       timestamp: new Date().toISOString(),
  //     });
  //   });
  // }
}
