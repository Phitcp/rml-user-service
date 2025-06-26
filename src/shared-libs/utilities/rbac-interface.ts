// src/interfaces/rbac.interface.ts
import { Observable } from 'rxjs';

export interface PermissionRequest {
  userId: string;
}

export interface PermissionResponse {
  allowed: boolean;
  reason: string;
  roles: string[];
  permissions: string[];
}

export interface UserRolesRequest {
  userId: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserRolesResponse {
  roles: Role[];
}

export interface RoleCheckRequest {
  userId: string;
  roleName: string;
}

export interface RoleCheckResponse {
  hasRole: boolean;
}

// gRPC Service Interface
export interface RBACServiceClient {
  checkPermission(PermissionRequest): Observable<PermissionResponse>;
  getUserRoles(data: UserRolesRequest): Observable<UserRolesResponse>;
  hasRole(data: RoleCheckRequest): Observable<RoleCheckResponse>;
}
