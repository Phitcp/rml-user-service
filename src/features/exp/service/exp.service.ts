import { Injectable } from '@nestjs/common';
import { AppContext } from '@shared/decorator/context.decorator';
import { AppLogger } from '@shared/logger';
import { PrismaService } from '@root/prisma/prisma.service';
import { ExpType } from '@prisma/client';

@Injectable()
export class ExpService {
  constructor(
    private readonly appLogger: AppLogger,
    private readonly prisma: PrismaService,
  ) {}
  /**
   * 
   */
  async validateExpResource(
    context: AppContext,
    data: any,
  ): Promise<any> {
    // Implementation here
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam('ExpService')
      .addMsgParam('validateExpResourceForUser')
      .log('Will validate Exp Resource');

    this.appLogger.log('Did validateExpResourceForUser');

    const resource = await this.prisma.expResource.findUnique({
      where: { id: data.resourceId },
    });

    if (!resource) {
      this.appLogger.log('Exp Resource not found');
      return {
        isValid: false,
        error: 'Exp Resource not found',
      };
    }
    const isValid = await this.Validator[resource.type](resource, data.user.userId);

    return {
      isValid,
    };
  }
  
  async markResourceClaimed(
    context: AppContext,
    data: any,
  ): Promise<any> {

  }

  private Validator = {
    [ExpType.LIMITED_ACCOUNT]: this.limitedAccountClaimedValidation,
    [ExpType.DAILY]: this.dailyClaimedValidation,
    [ExpType.WEEKLY]: this.weeklyClaimedValidation,
    [ExpType.LIMITED_SERVER]: this.limitedServerClaimedValidation,
  }

  private async limitedAccountClaimedValidation(resource: any, userId: string) {
    const isClaimed = await this.prisma.expClaim.findFirst({
      where: {
        expResourceId: resource.id,
        userId,
      },
    });
    return !isClaimed;
  }

  private dailyClaimedValidation(resource: any) {
    // Implementation here
    // This function will check if the user has already claimed this resource today
    // If yes, return an error response
    // If no, allow the claim to proceed
  }

  private weeklyClaimedValidation() {
    // Implementation here
    // This function will check if the user has already claimed this resource this week
    // If yes, return an error response
    // If no, allow the claim to proceed
  }

  private limitedServerClaimedValidation() {
    // Implementation here
    // This function will check if the user has reached the maximum claim limit for this resource
    // If yes, return an error response
    // If no, allow the claim to proceed
  }
}
