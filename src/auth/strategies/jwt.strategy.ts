import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'src/common/config';

export interface IUserCredential {
  userId: string;
  email: string;
  isVerified: boolean;
}

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  async validate(payload: IUserCredential) {
    return {
      userId: payload.userId,
      email: payload.email,
      isVerified: payload.isVerified,
    };
  }
}
