import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export const sendVerificationEmail = async (
  email: string,
  name: string,
  subject: string,
  htmlContent: string,
) => {
  const response = await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.BREVO_SENDER_NAME!,
      email: process.env.BREVO_SENDER_EMAIL!,
    },
    to: [
      {
        email,
        name,
      },
    ],
    subject,
    htmlContent,
  });

  return response;
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FROM_EMAIL!,
    pass: process.env.GMAIL_PASSWORD!,
  },
});

export const verifyEmail = async (email: string, token: string | number) => {
 const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  try {
    const info = await transporter.sendMail({
      from: `"EcoBazar" <${process.env.FROM_EMAIL!}>`,
      to: email,
      subject: "Verify your EcoBazar account",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your EcoBazar account</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f6f4; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius: 8px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color:#2e7d32; padding: 24px 32px; text-align:center;">
                    <h1 style="margin:0; color:#ffffff; font-size:22px; letter-spacing:0.5px;">EcoBazar</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="margin:0 0 12px; color:#1a1a1a; font-size:20px;">Verify your email</h2>
                    <p style="margin:0 0 24px; color:#555555; font-size:15px; line-height:1.6;">
                      Thanks for signing up with EcoBazar! Click the button below to verify your email address and activate your account. This link expires in 10 minutes.
                    </p>

                    <!-- CTA button -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 16px;">
                          <a href="${verifyUrl}" target="_blank"
                             style="display:inline-block; background-color:#2e7d32; color:#ffffff; text-decoration:none; font-size:16px; font-weight:bold; padding:14px 36px; border-radius:6px;">
                            Verify Email
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:16px 0 0; color:#888888; font-size:13px; line-height:1.6;">
                      Button not working? Copy and paste this link into your browser:<br />
                      <a href="${verifyUrl}" style="color:#2e7d32; word-break:break-all;">${verifyUrl}</a>
                    </p>

                    <p style="margin:24px 0 0; color:#888888; font-size:13px; line-height:1.6;">
                      If you didn't create an account with EcoBazar, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color:#fafafa; text-align:center; border-top:1px solid #eeeeee;">
                    <p style="margin:0; color:#aaaaaa; font-size:12px;">
                      &copy; ${new Date().getFullYear()} EcoBazar. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });

    console.log("Verification email sent:", info.messageId);
  } catch (error) {
    console.log(error);
  }
};
