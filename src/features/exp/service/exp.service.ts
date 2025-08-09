import { RedisService } from '@root/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { AppContext } from '@shared/decorator/context.decorator';
import { AppLogger } from '@shared/logger';
import { PrismaService } from '@root/prisma/prisma.service';
import { ExpResource, ExpType } from '@prisma/client';

export class ExpClaimedEvent {
  constructor(
    public readonly userId: string,
    public readonly expAmount: number,
    public readonly expResourceId: string,
  ) {}
}

export interface ValidateExpResultObject extends ExpResource {
  isValid?: boolean;
  error?: string;
}

@Injectable()
export class ExpService {
  constructor(
    private readonly appLogger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async claimExp(context: AppContext, data: any) {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam('ExpService')
      .addMsgParam('claimExp')
      .log('Will claim Exp');

    const validResource = await this.validateExpResource(context, data);
    if (!validResource.isValid) {
      this.appLogger.log('Exp Resource is invalid');
      throw new Error('Exp Resource is invalid');
    }

    await this.redis.client.publish(
      'exp.claimed',
      JSON.stringify({
        context,
        payload: {
          userId: data.userId,
          expAmount: validResource.expAmount,
          expResourceId: data.expResourceId,
        },
      }),
    );

    await this.ExpProcessor[validResource.type!](
      data.expResourceId,
      data.userId,
    );
  }

  async validateExpResource(
    context: AppContext,
    data: any,
  ): Promise<Partial<ValidateExpResultObject>> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam('ExpService')
      .addMsgParam('validateExpResourceForUser')
      .log('Will validate Exp Resource');

    if (!data.expResourceId) {
      this.appLogger.log('No resourceId provided');
      return {
        isValid: false,
        error: 'No resourceId provided',
      };
    }
    const resource = await this.prisma.expResource.findUnique({
      where: { id: data.expResourceId },
    });

    if (!resource) {
      this.appLogger.log('Exp Resource not found');
      return {
        isValid: false,
        error: 'Exp Resource not found',
      };
    }
    const isValid = await this.Validator[resource.type](resource, data.userId);
    this.appLogger.log('Did validateExpResourceForUser');

    return {
      isValid,
      ...resource,
    };
  }

  // MARK: EXP PROCESSOR -------------------------------------------------------------------------------------
  private Validator = {
    [ExpType.LIMITED_ACCOUNT]: (resource: ExpResource, userId: string) =>
      this.limitedAccountClaimedValidation(resource, userId),
    [ExpType.DAILY]: (resource: ExpResource, userId: string) =>
      this.dailyClaimedValidation(resource, userId),
    [ExpType.WEEKLY]: (resource: ExpResource, userId: string) =>
      this.weeklyClaimedValidation(resource, userId),
    [ExpType.LIMITED_SERVER]: (resource: ExpResource, userId: string) =>
      this.limitedServerClaimedValidation(resource, userId),
  };

  private async limitedAccountClaimedValidation(resource: any, userId: string) {
    const isClaimed = await this.prisma.expClaim.findFirst({
      where: {
        expResourceId: resource.id,
        userId,
      },
    });
    return !isClaimed;
  }

  private dailyClaimedValidation(resource: any, userId: string) {
    // Implementation here
    // This function will check if the user has already claimed this resource today
    // If yes, return an error response
    // If no, allow the claim to proceed
    return true; // Placeholder for actual implementation
  }

  private weeklyClaimedValidation(resource: any, userId: string) {
    // Implementation here
    // This function will check if the user has already claimed this resource this week
    // If yes, return an error response
    // If no, allow the claim to proceed

    return true;
  }

  private limitedServerClaimedValidation(resource: any, userId: string) {
    // Implementation here
    // This function will check if the user has reached the maximum claim limit for this resource
    // If yes, return an error response
    // If no, allow the claim to proceed

    return true;
  }
  // #endregion exp source validator

  async markResourceClaimed(context: AppContext, data: any): Promise<any> {}

  // #region event exp claimed emitter

  // #region exp processor post claimed event emitted
  private ExpProcessor = {
    [ExpType.LIMITED_ACCOUNT]: (resource: ExpResource, userId: string) =>
      this.limitedAccountProcessor(resource, userId),
    [ExpType.DAILY]: (resource: ExpResource, userId: string) =>
      this.dailyClaimedProcessor(resource, userId),
    [ExpType.WEEKLY]: (resource: ExpResource, userId: string) =>
      this.weeklyClaimedProcessor(resource, userId),
    [ExpType.LIMITED_SERVER]: (resource: ExpResource, userId: string) =>
      this.limitedServerClaimedProcessor(resource, userId),
  };

  private async limitedAccountProcessor(resource: ExpResource, userId: string) {
    // Implementation here
  }

  private async dailyClaimedProcessor(resource: ExpResource, userId: string) {
    // Implementation here
  }

  private async weeklyClaimedProcessor(resource: ExpResource, userId: string) {
    // Implementation here
  }

  private async limitedServerClaimedProcessor(
    resource: ExpResource,
    userId: string,
  ) {
    // Implementation here
  }
  // #endregion
}
