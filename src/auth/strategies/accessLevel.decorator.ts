import { SetMetadata } from '@nestjs/common';
import { EAccessLevel } from 'src/common/repos/credential';

export const ACCESS_LEVELS = 'accessLevels';

export const AccessLevels = (...accessLevels: EAccessLevel[]) =>
  SetMetadata(ACCESS_LEVELS, accessLevels);
