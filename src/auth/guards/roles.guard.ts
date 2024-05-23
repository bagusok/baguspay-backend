import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());

    console.log('Roles', roles);
    if (!roles) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('User', user);
    return matchRoles(roles, user.role);
  }
}

function matchRoles(roles: Role[], userRoles: Role) {
  console.log('MatchRoles', roles, userRoles);
  return roles.some((role) => role === userRoles);
}
