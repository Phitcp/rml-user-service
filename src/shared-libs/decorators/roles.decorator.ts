// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'required_permissions';

// Example: @Roles('post', ['read:own'])
export const Roles = (resource: string, actions: string[]) =>
  SetMetadata(ROLES_KEY, { resource, actions });
