import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationEmail(email: string, code: string) {
    try {
      await this.resend.emails.send({
        from: 'Aura App <onboarding@resend.dev>',
        to: email,
        subject: code,
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Seu código de verificação</h2>
            <h1 style="letter-spacing: 5px;">${code}</h1>
            <p>Esse código expira em 10 minutos.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error('Erro ao enviar email', error);
      throw error;
    }
  }
}
