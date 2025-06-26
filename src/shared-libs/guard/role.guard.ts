// common/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@shared/decorators/roles.decorator';
import { RbacClient } from '@shared/utilities/rbac-client';
// import { RbacService } from '@/rbac/rbac.service';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private client: RbacClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { resource, actions } =
      this.reflector.get<{ resource: string; actions: string[] }>(
        ROLES_KEY,
        context.getHandler(),
      ) || {};

    if (!resource || !actions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('User not found');

    const rbacService = this.client.getRbacService();

    try {
      const data = await firstValueFrom(
        rbacService.checkPermission({ userId: 'abc' }),
      );
      console.log(data);
    } catch (error) {
      console.log(error);
    }

    // const data = firstValueFrom(rbacService.checkPermission());
    // if (!hasPermission) {
    //   throw new ForbiddenException(
    //     `Permission denied for ${resource}: ${actions.join(', ')}`,
    //   );
    // }
    return true;
  }
}
