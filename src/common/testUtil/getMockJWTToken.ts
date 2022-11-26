import { JwtService } from '@nestjs/jwt';
import { EAccessLevel } from '../repos/credential';
import { EOrgUserRole } from '../repos/orgUser/orgUser.interface';

export const getMockJWTToken = async (
  jwtService: JwtService,
  {
    userId,
    email,
    isVerified,
    accessLevel,
    organisationId,
    orgUserRole,
  }: {
    userId?: string;
    email?: string;
    isVerified: boolean;
    accessLevel: EAccessLevel;
    organisationId?: string;
    orgUserRole?: EOrgUserRole.ADMIN;
  },
) => {
  return jwtService.signAsync({
    userId: userId ?? 'someuserid',
    email: email ?? 'fulan@ranggarifqi.com',
    isVerified,
    accessLevel,
    organisationId: organisationId ?? 'someorgid',
    orgUserRole: orgUserRole ?? EOrgUserRole.ADMIN,
  });
};
