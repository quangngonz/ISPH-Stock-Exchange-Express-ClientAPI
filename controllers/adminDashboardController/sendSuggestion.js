const nodemailer = require('nodemailer');

require('dotenv').config();
const { SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD } = process.env;

const sendSuggestion = async (req, res) => {
  const { sender, suggestion } = req.body;

  if (!sender || !suggestion) {
    return res.status(400).send('Please provide both sender and suggestion.');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: SMTP_EMAIL,
    to: 'quang.n.student@isph.edu.vn',
    subject: `Suggestion from ${sender.name || sender.email}`,
    text: `Suggestion: ${suggestion} \n\n Sender: ${sender.name} - ${sender.userId} \n\n Email: ${sender.email}`,
  }

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email.');
  }
}

module.exports = { sendSuggestion };
