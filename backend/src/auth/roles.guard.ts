import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si aucun rôle n'est requis, on autorise l'accès
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Si l'utilisateur n'est pas connecté ou n'a pas de rôle, refus
    if (!user || !user.role) {
        return false;
    }

    // On vérifie si le rôle de l'utilisateur correspond à l'un des rôles requis
    return requiredRoles.some((role) => user.role.includes(role));
  }
}
