import { Module, Provider } from '@nestjs/common';
import { BcryptHasherService } from './bcryptHasher.service';
import { HasherService } from './hasher.interface';

const provider: Provider = {
  provide: HasherService,
  useClass: BcryptHasherService,
};

@Module({
  providers: [provider],
  exports: [provider],
})
export class HasherModule {}
