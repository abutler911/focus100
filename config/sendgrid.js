const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Use your API key from the environment variables

/**
 * Sends an email using SendGrid
 * @param {string} to - The recipient's email address
 * @param {string} subject - The email subject
 * @param {string} text - The plain text content
 * @param {string} html - The HTML content (optional)
 */
async function sendEmail(to, subject, text, html = text) {
  try {
    const msg = {
      to,
      from: "support@focus-100.com",
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response ? error.response.body : error.message
    );
    throw new Error("Email sending failed");
  }
}

module.exports = sendEmail;
