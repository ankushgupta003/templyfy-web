import nodemailer from "nodemailer";
import { AppError } from "../middleware/errorHandler";
import { env } from "./env";

type SendMailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

const useJsonTransport =
  env.NODE_ENV === "test" || (env.EMAIL_HOST?.includes("example.com") ?? false) || env.EMAIL_USER === "smtp-user";

const smtpTransport =
  !env.RESEND_API_KEY && !useJsonTransport
    ? nodemailer.createTransport({
        host: env.EMAIL_HOST!,
        port: env.EMAIL_PORT!,
        secure: env.EMAIL_PORT === 465,
        auth: {
          user: env.EMAIL_USER!,
          pass: env.EMAIL_PASS!,
        },
      })
    : nodemailer.createTransport({
        jsonTransport: true,
      });

export const mailer = {
  async sendMail(input: SendMailInput) {
    if (env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: input.from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new AppError(`Resend email send failed: ${body || response.statusText}`, 500);
      }

      return;
    }

    await smtpTransport.sendMail(input);
  },
};
