const nodemailer = require('nodemailer');

require('dotenv').config();
const { EMAIL, EMAIL_PASSWORD } = process.env;

const sendSuggestion = async (req, res) => {
  const { sender, suggestion } = req.body;

  if (!sender || !suggestion) {
    return res.status(400).send('Please provide both sender and suggestion.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL,
    to: EMAIL,
    subject: `Suggestion from ${sender.name || sender.email}`,
    text: `Suggestion: ${suggestion} \n\n Sender: ${JSON.stringify(sender)}`,
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
