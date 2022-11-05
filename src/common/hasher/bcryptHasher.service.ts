import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { HasherService } from './hasher.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptHasherService extends HasherService {
  hash(rawPassword: string): Promise<string> {
    return bcrypt.hash(rawPassword, SALT_ROUNDS);
  }
  compare(passwordToCompare: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(passwordToCompare, hashedPassword);
  }
}
