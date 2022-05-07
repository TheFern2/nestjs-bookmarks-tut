import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    // what is the required role
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // ignore endpoints with no roles guard
    if (!requiredRoles) {
      return true;
    }

    // does the curr user has required roles
    const { user } = context.switchToHttp().getRequest();
    //console.log(user.roles);

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
