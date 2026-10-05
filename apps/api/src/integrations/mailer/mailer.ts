import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { unavailable } from "../../shared/errors.js";

/** SMTP adapter. Dev: Mailpit (docker). Prod: SES SMTP credentials. Unconfigured → 503 so the outbox retries later. */
export const mailer = {
  get configured() {
    return Boolean(env.SMTP_HOST);
  },
  async send(msg: { to: string; subject: string; html: string; text?: string }) {
    if (!this.configured) throw unavailable("MAIL_NOT_CONFIGURED", "SMTP_HOST is not set");
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } } : {}),
    });
    const info = await transport.sendMail({ from: env.SMTP_FROM, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text });
    return info.messageId;
  },
};
