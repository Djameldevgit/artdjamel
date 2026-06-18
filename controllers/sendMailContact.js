const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const i18n = require('i18n'); // Usamos el mismo i18n del servidor

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

const sendMailContact = async (to, lang = 'es', subject = '', html = '') => {
  try {
    oauth2Client.setCredentials({
      refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    });

    const accessToken = await oauth2Client.getAccessToken();

    // Aseguramos que sea un idioma válido
    if (!i18n.getLocales().includes(lang)) {
      console.warn(`Idioma no válido recibido (${lang}), usando 'es' por defecto.`);
      lang = 'es';
    }

    i18n.setLocale(lang);
    console.log(`📨 Enviando mensaje de contacto a ${to} en idioma: ${lang}`);

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
      from: SENDER_EMAIL_ADDRESS,
      to: 'artealger2020argelia@gmail.com',
      subject: subject || i18n.__('email.supportSubject'),
      html: html || `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
          <h2 style="text-align: center; color: teal;">
            ${i18n.__('email.supportTitle')}
          </h2>
          <p>${i18n.__('email.supportBody')}</p>
        </div>
      `
    };

    await smtpTransport.sendMail(mailOptions);
     } catch (err) {
    console.error('❌ Error al enviar el correo de contacto:', err.message);
    throw err;
  }
};

module.exports = sendMailContact;
