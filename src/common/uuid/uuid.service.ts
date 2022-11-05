import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { BaseUUIDService } from './baseUuid.service';

@Injectable()
export class UUIDService extends BaseUUIDService {
  generateV4(): string {
    return v4();
  }
}
