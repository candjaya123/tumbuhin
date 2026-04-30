import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, ROLES_KEY } from './role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('Akses ditolak: Role pengguna tidak ditemukan.');
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);
    
    if (!hasRole) {
      throw new ForbiddenException(`Akses ditolak: Role ${user.role} tidak memiliki izin untuk fitur ini.`);
    }

    return true;
  }
}
