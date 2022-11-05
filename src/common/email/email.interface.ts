export abstract class EmailService {
  abstract sendHtmlEmail(payload: ISendEmail): Promise<void>;
}

export interface ISendEmail {
  from?: string;
  to: string;
  ccs?: string[];
  subject: string;
  body: string;
}
