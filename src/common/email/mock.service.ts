import { Injectable } from '@nestjs/common';
import { EmailService, ISendEmail } from './email.interface';

@Injectable()
export class MockEmailService extends EmailService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendHtmlEmail(_payload: ISendEmail): Promise<void> {
    return Promise.resolve();
  }
}
