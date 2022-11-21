import { JwtService } from '@nestjs/jwt';
import { EAccessLevel } from '../repos/credential';

export const getMockJWTToken = async (
  jwtService: JwtService,
  {
    userId,
    email,
    isVerified,
    accessLevel,
  }: {
    userId?: string;
    email?: string;
    isVerified: boolean;
    accessLevel: EAccessLevel;
  },
) => {
  return jwtService.signAsync({
    userId: userId ?? 'someuserid',
    email: email ?? 'fulan@ranggarifqi.com',
    isVerified,
    accessLevel,
  });
};
