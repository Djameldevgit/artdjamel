const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const i18n = require('i18n');

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS
} = process.env;

const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

const sendSupportMessage = async ({ from, subject, message, lang = 'es' }) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    });

    const accessToken = await oauth2Client.getAccessToken();

    if (!i18n.getLocales().includes(lang)) {
      lang = 'es';
    }

    i18n.setLocale(lang);
   
    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SENDER_EMAIL_ADDRESS,
        clientId: MAILING_SERVICE_CLIENT_ID,
        clientSecret: MAILING_SERVICE_CLIENT_SECRET,
        refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
        accessToken
      }
    });

    const mailOptions = {
      from: `"Contacto Usuario" <${SENDER_EMAIL_ADDRESS}>`,
      to: 'artealger2020argelia@gmail.com', // email del admin
      subject: i18n.__('support.subject', { subject }), // puedes traducir con `{{subject}}`
      html: `
        <div style="max-width: 700px; margin:auto; border: 1px solid #ccc; padding: 30px; font-size: 110%;">
          <h3>${i18n.__('support.title')}</h3>
          <p><strong>${i18n.__('support.email')}:</strong> ${from}</p>
          <p><strong>${i18n.__('support.subjectLabel')}:</strong> ${subject}</p>
          <p><strong>${i18n.__('support.message')}:</strong></p>
          <p style="white-space: pre-line; background-color: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
            ${message}
          </p>
        </div>
      `
    };

    await smtpTransport.sendMail(mailOptions);
      } catch (err) {
    console.error('❌ Error al enviar mensaje de contacto:', err.message);
    throw err;
  }
};

module.exports = sendSupportMessage;
