import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');

    if (!host) {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST not set; password reset emails will be logged instead of sent',
      );
    } else {
      this.transporter = createTransport({
        host,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: this.configService.getOrThrow<string>('SMTP_USER'),
          pass: this.configService.getOrThrow<string>('SMTP_PASS'),
        },
      });
    }

    this.from = this.configService.get<string>(
      'SMTP_FROM',
      '"Odonto" <no-reply@odonto.app>',
    );
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const resetLink = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080')}/reset-password?token=${resetToken}`;

    if (!this.transporter) {
      this.logger.log(`[dev] Password reset for ${to}: link=${resetLink}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Odonto — Reset your password',
      text: `Click the link to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.`,
      html: `<p>Click the link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`,
    });
  }
}
