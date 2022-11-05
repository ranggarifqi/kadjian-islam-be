import { Injectable } from '@nestjs/common';
import { HasherService } from './hasher.interface';

@Injectable()
export class MockHasher extends HasherService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hash(rawPassword: string): Promise<string> {
    return Promise.resolve('hashedPassword');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compare(passwordToCompare: string, hashedPassword: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}
