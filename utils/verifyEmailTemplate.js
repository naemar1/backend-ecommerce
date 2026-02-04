// const { Resend } = require('resend');

const VerificationEmail = (name, otp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #4CAF50;
    }
    .content {
      text-align: center;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
    }
    .otp {
      display: inline-block;
      background: #4CAF50;
      color: #fff;
      padding: 10px 20px;
      font-size: 20px;
      letter-spacing: 4px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 14px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
     <h1>👋 Hii ${name}, Welcome to Next Generation E-Commerce App! 🛍️</h1>
    </div>
    <div class="content">
      <p>🎉 Thank you for creating an account in the Next Generation UdrCrafts E-Commerce App! 🛍️
Please use the OTP below to verify your account 🔐✨:</p>
      <div class="otp">${otp}</div>
      <p>If you didn’t create an account, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 UdrCrafts . All rights reserved.</p>

    </div>
  </div>
</body>
</html>`;
};

export default VerificationEmail;

// const resend = new Resend(process.env.RESEND_API_KEY);

// exports.sendVerificationEmail = async (email, verifyCode, username) => {
//     try {
//         await resend.emails.send({
//             from: "onboarding@resend.dev",
//             to: email,
//             subject: "Ecommerce || Verification code",
//             html: VerificationEmail(username, verifyCode),
//         });

//         return {
//             success: true,
//             message: "Verification email sent successfully",
//         };
//     } catch (error) {
//         console.error("Error sending verification email:", error);
//         return {
//             success: false,
//             message: "Failed to send verification email",
//             error,
//         };
//     }
// };
