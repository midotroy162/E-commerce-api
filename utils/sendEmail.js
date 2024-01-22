const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1- Create transporter (services that will send email like""gmail","mailgun","mailtrap","senGrid")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2- Define email options (like from, to , subject, email content)
  const mailOpts = {
    from: "E-shop app <Hypervision100@gamil.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3- Send Email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
