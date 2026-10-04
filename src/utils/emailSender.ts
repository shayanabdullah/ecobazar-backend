import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();


const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export const sendVerificationEmail = async (
  email: string,
  name: string,
  otp: string,
) => {
  try {
    const response =
      await brevo.transactionalEmails.sendTransacEmail({
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

        subject: "Verify your EcoBazar account",

        htmlContent: `
          <!DOCTYPE html>
          <html>
            <body
              style="
                margin:0;
                padding:40px 20px;
                background:#f4f6f4;
                font-family:Arial, Helvetica, sans-serif;
              "
            >

              <div
                style="
                  max-width:480px;
                  margin:auto;
                  background:#ffffff;
                  border-radius:8px;
                  overflow:hidden;
                  box-shadow:0 2px 8px rgba(0,0,0,0.05);
                "
              >

                <!-- Header -->
                <div
                  style="
                    background:#2e7d32;
                    padding:24px;
                    text-align:center;
                  "
                >
                  <h1
                    style="
                      margin:0;
                      color:#ffffff;
                      font-size:22px;
                    "
                  >
                    EcoBazar
                  </h1>
                </div>

                <!-- Content -->
                <div style="padding:32px;">

                  <h2
                    style="
                      margin:0 0 16px;
                      color:#222222;
                      font-size:21px;
                    "
                  >
                    Verify your email
                  </h2>

                  <p
                    style="
                      color:#555555;
                      line-height:1.6;
                      font-size:15px;
                    "
                  >
                    Hi ${name},
                  </p>

                  <p
                    style="
                      color:#555555;
                      line-height:1.6;
                      font-size:15px;
                    "
                  >
                    Thanks for creating your EcoBazar account.
                    Please use the verification code below to verify
                    your email address.
                  </p>

                  <!-- OTP -->
                  <div
                    style="
                      text-align:center;
                      margin:30px 0;
                    "
                  >

                    <p
                      style="
                        margin:0 0 10px;
                        color:#888888;
                        font-size:13px;
                        text-transform:uppercase;
                        letter-spacing:1px;
                      "
                    >
                      Verification Code
                    </p>

                    <div
                      style="
                        display:inline-block;
                        background:#f1f8f1;
                        border:1px solid #d5ead6;
                        border-radius:8px;
                        padding:16px 28px;
                      "
                    >
                      <span
                        style="
                          color:#2e7d32;
                          font-size:30px;
                          font-weight:bold;
                          letter-spacing:8px;
                        "
                      >
                        ${otp}
                      </span>
                    </div>

                  </div>

                  <p
                    style="
                      color:#888888;
                      font-size:13px;
                      line-height:1.6;
                    "
                  >
                    This verification code will expire in
                    <strong>10 minutes</strong>.
                  </p>

                  <div
                    style="
                      margin-top:24px;
                      padding:14px 16px;
                      background:#f8f9f8;
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
                      If you didn't create an EcoBazar account,
                      you can safely ignore this email.
                    </p>
                  </div>

                </div>

                <!-- Footer -->
                <div
                  style="
                    padding:20px;
                    background:#fafafa;
                    text-align:center;
                    border-top:1px solid #eeeeee;
                  "
                >
                  <p
                    style="
                      margin:0;
                      color:#aaaaaa;
                      font-size:12px;
                    "
                  >
                    © ${new Date().getFullYear()} EcoBazar.
                    All rights reserved.
                  </p>
                </div>

              </div>

            </body>
          </html>
        `,
      });

    console.log(
      "Verification OTP email sent:",
      response.messageId,
    );

    return response;
  } catch (error) {
    console.error(
      "Failed to send verification OTP email:",
      error,
    );

    throw error;
  }
};

export const sendForgotPasswordEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  try {
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
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

export const sendSubCategoryApprovalEmail = async (
  vendorName: string,
  subCategoryName: string,
  categoryName: string,
) => {
  try {
    const adminName = process.env.ADMIN_NAME!;
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME!,
        email: process.env.BREVO_SENDER_EMAIL!,
      },

      to: [
        {
          email: process.env.ADMIN_EMAIL!,
          name: adminName,
        },
      ],

      subject: "New subcategory requires approval - EcoBazar",

      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>New subcategory requires approval</title>
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
                          New Subcategory Requires Approval
                        </h2>

                        <p
                          style="
                            margin:0 0 16px;
                            color:#555555;
                            font-size:15px;
                            line-height:1.6;
                          "
                        >
                          Hi ${adminName},
                        </p>

                        <p
                          style="
                            margin:0 0 20px;
                            color:#555555;
                            font-size:15px;
                            line-height:1.6;
                          "
                        >
                          A vendor has created a new subcategory on
                          EcoBazar. The subcategory is currently inactive
                          and requires your approval.
                        </p>

                        <!-- Details -->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                          style="
                            margin:0 0 24px;
                            background-color:#f8f9f8;
                            border-radius:6px;
                          "
                        >
                          <tr>
                            <td
                              style="
                                padding:12px 16px;
                                color:#777777;
                                font-size:13px;
                              "
                            >
                              Subcategory
                            </td>

                            <td
                              align="right"
                              style="
                                padding:12px 16px;
                                color:#333333;
                                font-size:14px;
                                font-weight:600;
                              "
                            >
                              ${subCategoryName}
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="
                                padding:12px 16px;
                                color:#777777;
                                font-size:13px;
                              "
                            >
                              Category
                            </td>

                            <td
                              align="right"
                              style="
                                padding:12px 16px;
                                color:#333333;
                                font-size:14px;
                                font-weight:600;
                              "
                            >
                              ${categoryName}
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="
                                padding:12px 16px;
                                color:#777777;
                                font-size:13px;
                              "
                            >
                              Created by
                            </td>

                            <td
                              align="right"
                              style="
                                padding:12px 16px;
                                color:#333333;
                                font-size:14px;
                                font-weight:600;
                              "
                            >
                              ${vendorName}
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="
                                padding:12px 16px;
                                color:#777777;
                                font-size:13px;
                              "
                            >
                              Status
                            </td>

                            <td
                              align="right"
                              style="
                                padding:12px 16px;
                                color:#d97706;
                                font-size:14px;
                                font-weight:600;
                              "
                            >
                              Inactive - Approval Required
                            </td>
                          </tr>
                        </table>

                        <!-- Notice -->
                        <div
                          style="
                            margin-top:8px;
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
                            Please review this subcategory from the
                            admin panel and either activate or reject it.
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

    console.log(
      "Subcategory approval email sent:",
      response.messageId,
    );

    return response;
  } catch (error) {
    console.error(
      "Failed to send subcategory approval email:",
      error,
    );

    throw error;
  }
};


export const sendAdminSubCategoryCreatedEmail = async (
  subCategoryName: string,
  categoryName: string,
) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME!,
        email: process.env.BREVO_SENDER_EMAIL!,
      },

      to: [
        {
          email: process.env.ADMIN_EMAIL!,
          name: process.env.ADMIN_NAME!,
        },
      ],

      subject: "Subcategory created successfully - EcoBazar",

      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>Subcategory created successfully</title>
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
                          Subcategory Created Successfully
                        </h2>

                        <p
                          style="
                            margin:0 0 16px;
                            color:#555555;
                            font-size:15px;
                            line-height:1.6;
                          "
                        >
                          Hi ${process.env.ADMIN_NAME!},
                        </p>

                        <p
                          style="
                            margin:0 0 20px;
                            color:#555555;
                            font-size:15px;
                            line-height:1.6;
                          "
                        >
                          A new subcategory has been created by an
                          administrator on EcoBazar.
                        </p>

                        <!-- Details -->
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                          style="
                            margin:0 0 24px;
                            background-color:#f8f9f8;
                            border-radius:6px;
                          "
                        >
                          <tr>
                            <td
                              style="
                                padding:12px 16px;
                                color:#777777;
                                font-size:13px;
                              "
                            >
                              Subcategory
                            </td>

                            <td
                              align="right"
                              style="
                                padding:12px 16px;
                                color:#333333;
                                font-size:14px;
                                font-weight:600;
                              "
                            >
                              ${subCategoryName}
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="
                                padding:12px 16px;
                                color:#777777;
                                font-size:13px;
                              "
                            >
                              Category
                            </td>

                            <td
                              align="right"
                              style="
                                padding:12px 16px;
                                color:#333333;
                                font-size:14px;
                                font-weight:600;
                              "
                            >
                              ${categoryName}
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="
                                padding:12px 16px;
                                color:#777777;
                                font-size:13px;
                              "
                            >
                              Status
                            </td>

                            <td
                              align="right"
                              style="
                                padding:12px 16px;
                                color:#2e7d32;
                                font-size:14px;
                                font-weight:600;
                              "
                            >
                              Active
                            </td>
                          </tr>
                        </table>

                        <!-- Notice -->
                        <div
                          style="
                            margin-top:8px;
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
                            This subcategory was created by an
                            administrator, so no approval or activation
                            is required.
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

    console.log(
      "Admin subcategory creation email sent:",
      response.messageId,
    );

    return response;
  } catch (error) {
    console.error(
      "Failed to send admin subcategory creation email:",
      error,
    );

    throw error;
  }
};

export const sendSubCategoryRejectedEmail = async (
  vendorEmail: string,
  vendorName: string,
  subCategoryName: string,
  categoryName: string,
) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME!,
        email: process.env.BREVO_SENDER_EMAIL!,
      },

      to: [{ email: vendorEmail, name: vendorName }],

      subject: "Subcategory rejected - EcoBazar",

     htmlContent: `
  <div style="
    margin: 0;
    padding: 40px 20px;
    background-color: #f5f7f5;
    font-family: Arial, Helvetica, sans-serif;
  ">

    <div style="
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    ">

      <!-- Header -->
      <div style="
        background-color: #2e7d32;
        padding: 25px;
        text-align: center;
      ">
        <h1 style="
          margin: 0;
          color: #ffffff;
          font-size: 28px;
        ">
          EcoBazar
        </h1>

        <p style="
          margin: 8px 0 0;
          color: #eaffea;
          font-size: 14px;
        ">
          Fresh products. Better shopping.
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 35px 30px;">

        <h2 style="
          margin-top: 0;
          color: #2c742f;
          font-size: 22px;
        ">
          Subcategory Submission Update
        </h2>

        <p style="
          color: #555555;
          font-size: 15px;
          line-height: 1.7;
        ">
          Hello <strong>${vendorName}</strong>,
        </p>

        <p style="
          color: #555555;
          font-size: 15px;
          line-height: 1.7;
        ">
          Thank you for submitting a new subcategory to EcoBazar.
          After reviewing your submission, our administrator has decided
          that the subcategory could not be approved at this time.
        </p>

        <!-- Rejection Notice -->
        <div style="
          margin: 25px 0;
          padding: 20px;
          background-color: #fff5f5;
          border-left: 4px solid #e53935;
          border-radius: 6px;
        ">

          <p style="
            margin: 0 0 12px;
            color: #c62828;
            font-size: 16px;
            font-weight: bold;
          ">
            Submission Rejected
          </p>

          <p style="
            margin: 7px 0;
            color: #555555;
            font-size: 14px;
          ">
            <strong>Subcategory:</strong> ${subCategoryName}
          </p>

          <p style="
            margin: 7px 0;
            color: #555555;
            font-size: 14px;
          ">
            <strong>Category:</strong> ${categoryName}
          </p>

          <p style="
            margin: 7px 0;
            color: #555555;
            font-size: 14px;
          ">
            <strong>Status:</strong>
            <span style="color: #c62828; font-weight: bold;">
              Rejected
            </span>
          </p>

        </div>

        <p style="
          color: #555555;
          font-size: 15px;
          line-height: 1.7;
        ">
          The submitted subcategory was not approved based on the current
          EcoBazar requirements. You can review your submission and submit
          a new subcategory with the necessary changes.
        </p>

        <p style="
          color: #555555;
          font-size: 15px;
          line-height: 1.7;
        ">
          We appreciate your contribution and cooperation in keeping the
          EcoBazar marketplace organized and high quality.
        </p>

        <p style="
          margin-top: 30px;
          color: #555555;
          font-size: 15px;
          line-height: 1.6;
        ">
          Best regards,<br>
          <strong style="color: #2c742f;">
            EcoBazar Team
          </strong>
        </p>

      </div>

      <!-- Footer -->
      <div style="
        padding: 18px 25px;
        background-color: #f8faf8;
        text-align: center;
        border-top: 1px solid #eeeeee;
      ">

        <p style="
          margin: 0;
          color: #888888;
          font-size: 12px;
        ">
          © ${new Date().getFullYear()} EcoBazar. All rights reserved.
        </p>

        <p style="
          margin: 6px 0 0;
          color: #aaaaaa;
          font-size: 12px;
        ">
          This is an automated notification from EcoBazar.
        </p>

      </div>

    </div>
  </div>
`,
    });

    console.log("Subcategory rejection email sent:", response.messageId);

    return response;
  } catch (error) {
    console.error("Failed to send subcategory rejection email:", error);
    throw error;
  }
};