const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const i18n = require('i18n'); // Traductor

const OAuth2 = google.auth.OAuth2;

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS
} = process.env;

// Inicializar cliente OAuth2
const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: MAILING_SERVICE_REFRESH_TOKEN
});

const sendMail = async (to, url = '#', lang = 'es', template = 'informativo', customSubject = null, customMessage = null) => {
  try {
    // Obtener token de acceso desde refresh_token
    const { token: accessToken } = await oauth2Client.getAccessToken();

    // Establecer idioma
    if (!i18n.getLocales().includes(lang)) {
      lang = 'es';
    }
    i18n.setLocale(lang);

    // 🧠 Usamos plantillas como: emailReset, emailActivation, etc.
    const key = `email${template.charAt(0).toUpperCase()}${template.slice(1)}`;

    const subject = customSubject || i18n.__(`${key}.subject`);
    const body = customMessage || i18n.__(`${key}.body`);
    const button = i18n.__(`${key}.button`);
    const alt = i18n.__(`${key}.alt`);

    // HTML del correo
    const html = `
      <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase; color: teal;">${subject}</h2>
        <p>${body}</p>
        ${url !== '#' ? `<a href="${url}" style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${button}</a>` : ''}
        <p>${alt}</p>
        <div>${url}</div>
      </div>
    `;

    // Configurar transporte SMTP
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

    // Enviar el correo
    await smtpTransport.sendMail({
      from: SENDER_EMAIL_ADDRESS,
      to,
      subject,
      html
    });

    console.log(`📨 Correo enviado correctamente a ${to}`);
  } catch (err) {
    console.error('❌ Error al enviar el correo:', err.message);
    throw err;
  }
};

module.exports = sendMail;
