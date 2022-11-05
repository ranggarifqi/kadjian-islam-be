import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { EmailService, ISendEmail } from './email.interface';

@Injectable()
export class NodemailerService extends EmailService {
  private getTransporter = () => {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_PORT === '465',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    } as SMTPTransport.Options);
  };

  async sendHtmlEmail(payload: ISendEmail): Promise<void> {
    const { from, to, ccs, subject, body } = payload;

    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: from ?? process.env.MAIL_USER,
      to,
      cc: ccs,
      subject,
      html: body,
    });

    return;
  }
}
