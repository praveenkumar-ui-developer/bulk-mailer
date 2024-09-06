require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post('/sendemail', (req, res) => {
    const { from, to, subject, body } = req.body;
  
    // Split the 'to' field into an array of emails (trim whitespace)
    const emailList = to.split(/[\s,]+/).filter(email => email); // Handles both spaces and commas
  
    // Tracking variables
    let sentCount = 0;
    let failedCount = 0;
    let emailErrors = [];
  
    // Check if there are any valid emails
    if (emailList.length === 0) {
      return res.status(400).send('No valid email addresses provided.');
    }
  
    // Loop through each email and send separately
    emailList.forEach((email) => {
      const mailOptions = {
        from,
        to: email.trim(), // Send to each recipient separately
        subject,
        text: body,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Error sending to ${email}:`, error);
          failedCount++;
          emailErrors.push(email); // Collect failed email addresses
        } else {
          console.log(`Email sent to ${email}:`, info.response);
          sentCount++;
        }
  
        // After all emails have been processed
        if (sentCount + failedCount === emailList.length) {
          if (failedCount > 0) {
            return res.status(500).send(`Failed to send to ${emailErrors.join(', ')}.`);
          } else {
            return res.status(200).send('All emails sent successfully!');
          }
        }
      });
    });
  });
  

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
