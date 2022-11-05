import { Module, Provider } from '@nestjs/common';
import { EmailService } from './email.interface';
import { NodemailerService } from './nodemailer.service';

const provider: Provider = {
  provide: EmailService,
  useClass: NodemailerService,
};

@Module({
  providers: [provider],
  exports: [provider],
})
export class EmailModule {}
