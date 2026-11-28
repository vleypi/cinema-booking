import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { type EnvironmentVariables, NodeEnvironment } from '@/config/environment.js';

export interface IMailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface ISendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: IMailAttachment[];
}

@Injectable()
export class MailService {
  readonly #transporter: Transporter;
  readonly #from: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    this.#from = config.get('SMTP_FROM', { infer: true });
    const isTest = config.get('NODE_ENV', { infer: true }) === NodeEnvironment.Test;

    this.#transporter = isTest
      ? createTransport({ jsonTransport: true })
      : createTransport({
          host: config.get('SMTP_HOST', { infer: true }),
          port: config.get('SMTP_PORT', { infer: true }),
          secure: false,
        });
  }

  async sendMail({ to, subject, text, html, attachments }: ISendMailOptions): Promise<void> {
    await this.#transporter.sendMail({
      from: this.#from,
      to,
      subject,
      text,
      html,
      attachments: attachments?.map((attachment) => ({ ...attachment })),
    });
  }
}
