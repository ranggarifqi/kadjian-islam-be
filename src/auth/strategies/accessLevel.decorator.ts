import { SetMetadata } from '@nestjs/common';
import { EAccessLevel } from 'src/common/repos/credential';

export const AccessLevels = (...accessLevels: EAccessLevel[]) =>
  SetMetadata('accessLevels', accessLevels);
