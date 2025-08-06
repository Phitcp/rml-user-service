import { Injectable } from '@nestjs/common';
import { AppContext } from '@shared/decorator/context.decorator';
import {
  CreateExpResourceRequest,
  CreateExpResourceResponse,
} from '@root/interface/exp.proto.interface';
import { AppLogger } from '@shared/logger';
import { PrismaService } from '@root/prisma/prisma.service';

@Injectable()
export class ExpAdminService {
  constructor(
    private readonly appLogger: AppLogger,
    private readonly prisma: PrismaService,
  ) {}
  async createExpResource(
    // this is just a temporary logic, will implement real logic later for every type of resources
    context: AppContext,
    data: CreateExpResourceRequest,
  ): Promise<CreateExpResourceResponse> {
    // Implementation here
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam('ExpService')
      .addMsgParam('createExpResource')
      .log('Will Creating Exp Resource');

    const resourceObject = {
      type: data.type,
      title: JSON.stringify(data.title),
      description: JSON.stringify(data.description),
      maxClaimAccount: data.maxClaimAccount,
      maxClaimServer: data.maxClaimServer,
      status: data.status,
      expAmount: data.expAmount,
    };
    const result = await this.prisma.expResource.create({
      data: resourceObject,
    });
    this.appLogger.log('Did createExpResource');
    return {
      isSuccess: true,
      id: result.id,
    };
  }
}
