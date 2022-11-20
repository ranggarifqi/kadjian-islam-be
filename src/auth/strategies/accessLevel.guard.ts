import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { EAccessLevel } from 'src/common/repos/credential';
import { IUserCredential } from './jwt.strategy';

@Injectable()
export class AccessLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const accessLevels = this.reflector.get<EAccessLevel[]>(
      'accessLevels',
      context.getHandler(),
    );

    if (!accessLevels) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as IUserCredential;

    return accessLevels.includes(user.accessLevel);
  }
}
