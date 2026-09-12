import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();
const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});
export const sendVerificationEmail = async (email, name, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    try {
        const response = await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: process.env.BREVO_SENDER_NAME,
                email: process.env.BREVO_SENDER_EMAIL,
            },
            to: [
                {
                    email,
                    name,
                },
            ],
            subject: "Verify your EcoBazar account",
            htmlContent: `
          <!DOCTYPE html>
          <html>
            <body style="margin:0;padding:40px;background:#f4f6f4;font-family:Arial,sans-serif;">
              
              <div style="
                max-width:480px;
                margin:auto;
                background:#ffffff;
                border-radius:8px;
                overflow:hidden;
              ">

                <div style="
                  background:#2e7d32;
                  padding:24px;
                  text-align:center;
                ">
                  <h1 style="
                    margin:0;
                    color:white;
                  ">
                    EcoBazar
                  </h1>
                </div>

                <div style="padding:32px;">

                  <h2 style="
                    margin-top:0;
                    color:#222;
                  ">
                    Verify your email
                  </h2>

                  <p style="
                    color:#555;
                    line-height:1.6;
                  ">
                    Hi ${name},
                  </p>

                  <p style="
                    color:#555;
                    line-height:1.6;
                  ">
                    Thanks for creating your EcoBazar account.
                    Please verify your email address to activate your account.
                  </p>

                  <div style="text-align:center;margin:30px 0;">

                    <a
                      href="${verifyUrl}"
                      target="_blank"
                      style="
                        display:inline-block;
                        background:#2e7d32;
                        color:#ffffff;
                        text-decoration:none;
                        padding:14px 32px;
                        border-radius:6px;
                        font-weight:bold;
                      "
                    >
                      Verify Email
                    </a>

                  </div>

                  <p style="
                    color:#888;
                    font-size:13px;
                    line-height:1.6;
                  ">
                    This verification link will expire in 10 minutes.
                  </p>

                  <p style="
                    color:#888;
                    font-size:13px;
                    line-height:1.6;
                    word-break:break-all;
                  ">
                    If the button doesn't work, copy this link:
                    <br />
                    <a
                      href="${verifyUrl}"
                      style="color:#2e7d32;"
                    >
                      ${verifyUrl}
                    </a>
                  </p>

                  <p style="
                    color:#888;
                    font-size:13px;
                  ">
                    If you didn't create an EcoBazar account,
                    you can safely ignore this email.
                  </p>

                </div>

                <div style="
                  padding:20px;
                  background:#fafafa;
                  text-align:center;
                  border-top:1px solid #eee;
                ">
                  <p style="
                    margin:0;
                    color:#aaa;
                    font-size:12px;
                  ">
                    © ${new Date().getFullYear()} EcoBazar.
                    All rights reserved.
                  </p>
                </div>

              </div>

            </body>
          </html>
        `,
        });
        console.log("Verification email sent:", response.messageId);
        return response;
    }
    catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
    }
};
//# sourceMappingURL=emailSender.js.map