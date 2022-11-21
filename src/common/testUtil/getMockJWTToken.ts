import { JwtService } from '@nestjs/jwt';
import { EAccessLevel } from '../repos/credential';

export const getMockJWTToken = async (
  jwtService: JwtService,
  {
    isVerified,
    accessLevel,
  }: { isVerified: boolean; accessLevel: EAccessLevel },
) => {
  return jwtService.signAsync({
    userId: 'someuserid',
    email: 'fulan@ranggarifqi.com',
    isVerified,
    accessLevel,
  });
};
