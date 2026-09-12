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
export const sendForgotPasswordEmail = async (email, name, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
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
            subject: "Reset your EcoBazar password",
            htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>Reset your EcoBazar password</title>
          </head>

          <body
            style="
              margin:0;
              padding:40px 20px;
              background-color:#f4f6f4;
              font-family:Arial, Helvetica, sans-serif;
            "
          >

            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >
              <tr>
                <td align="center">

                  <!-- Main Card -->
                  <table
                    role="presentation"
                    width="480"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                      width:100%;
                      max-width:480px;
                      background-color:#ffffff;
                      border-radius:10px;
                      overflow:hidden;
                      box-shadow:0 2px 8px rgba(0,0,0,0.05);
                    "
                  >

                    <!-- Header -->
                    <tr>
                      <td
                        align="center"
                        style="
                          background-color:#2e7d32;
                          padding:24px 32px;
                        "
                      >
                        <h1
                          style="
                            margin:0;
                            color:#ffffff;
                            font-size:22px;
                            font-weight:600;
                            letter-spacing:0.5px;
                          "
                        >
                          EcoBazar
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding:32px;">

                        <h2
                          style="
                            margin:0 0 16px;
                            color:#222222;
                            font-size:21px;
                            font-weight:600;
                          "
                        >
                          Reset your password
                        </h2>

                        <p
                          style="
                            margin:0 0 16px;
                            color:#555555;
                            font-size:15px;
                            line-height:1.6;
                          "
                        >
                          Hi ${name},
                        </p>

                        <p
                          style="
                            margin:0 0 20px;
                            color:#555555;
                            font-size:15px;
                            line-height:1.6;
                          "
                        >
                          We received a request to reset the password
                          associated with your EcoBazar account.
                        </p>

                        <p
                          style="
                            margin:0 0 24px;
                            color:#555555;
                            font-size:15px;
                            line-height:1.6;
                          "
                        >
                          Click the button below to create a new password
                          and regain access to your account.
                        </p>

                        <!-- CTA -->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                        >
                          <tr>
                            <td
                              align="center"
                              style="padding:8px 0 24px;"
                            >
                              <a
                                href="${resetUrl}"
                                target="_blank"
                                style="
                                  display:inline-block;
                                  background-color:#2e7d32;
                                  color:#ffffff;
                                  text-decoration:none;
                                  font-size:15px;
                                  font-weight:600;
                                  padding:14px 34px;
                                  border-radius:6px;
                                "
                              >
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Expiration -->
                        <p
                          style="
                            margin:0 0 16px;
                            color:#888888;
                            font-size:13px;
                            line-height:1.6;
                          "
                        >
                          For your security, this password reset link will
                          expire in <strong>10 minutes</strong>.
                        </p>

                        <!-- Fallback URL -->
                        <p
                          style="
                            margin:0 0 20px;
                            color:#888888;
                            font-size:13px;
                            line-height:1.6;
                            word-break:break-word;
                          "
                        >
                          If the button above doesn't work, copy and paste
                          the following link into your browser:
                          <br /><br />

                          <a
                            href="${resetUrl}"
                            style="
                              color:#2e7d32;
                              text-decoration:none;
                            "
                          >
                            ${resetUrl}
                          </a>
                        </p>

                        <!-- Security Notice -->
                        <div
                          style="
                            margin-top:24px;
                            padding:14px 16px;
                            background-color:#f8f9f8;
                            border-left:3px solid #2e7d32;
                          "
                        >
                          <p
                            style="
                              margin:0;
                              color:#777777;
                              font-size:13px;
                              line-height:1.6;
                            "
                          >
                            If you didn't request a password reset,
                            you can safely ignore this email. Your password
                            will remain unchanged.
                          </p>
                        </div>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td
                        align="center"
                        style="
                          padding:20px 32px;
                          background-color:#fafafa;
                          border-top:1px solid #eeeeee;
                        "
                      >
                        <p
                          style="
                            margin:0;
                            color:#aaaaaa;
                            font-size:12px;
                            line-height:1.5;
                          "
                        >
                          &copy; ${new Date().getFullYear()} EcoBazar.
                          All rights reserved.
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
        console.log("Password reset email sent:", response.messageId);
        return response;
    }
    catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
    }
};
//# sourceMappingURL=emailSender.js.map