import { Module, Provider } from '@nestjs/common';
import { BaseUUIDService } from './baseUuid.service';
import { UUIDService } from './uuid.service';

const provider: Provider = {
  provide: BaseUUIDService,
  useClass: UUIDService,
};

@Module({
  providers: [provider],
  exports: [provider],
})
export class UUIDModule {}
