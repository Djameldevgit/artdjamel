const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const i18n = require('i18n')

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
  SUPPORT_EMAIL_ADDRESS
} = process.env

const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
)

// Función para enviar email de verificación (existente)
const sendVerificationMail = async (to, url, lang = 'es') => {
  // ... (mantén tu función existente sin cambios)
}

// Nueva función para enviar email desde el formulario de bloqueo
const sendBlockSupportMail = async (userData, message, lang = 'es') => {
  try {
    oauth2Client.setCredentials({
      refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })

    const accessToken = await oauth2Client.getAccessToken()

    // Validación de idioma
    if (!i18n.getLocales().includes(lang)) {
      console.warn(`Idioma no válido recibido (${lang}), usando 'es' por defecto.`)
      lang = 'es'
    }

    i18n.setLocale(lang)
    console.log(`📨 Enviando solicitud de soporte por bloqueo desde ${userData.email} en idioma: ${lang}`)

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
    })

    const sendBlockSupportMail = async (userData, message, lang = 'es') => {
      // ... configuración de nodemailer ...
      
      const mailOptions = {
        from: SENDER_EMAIL_ADDRESS,
        to: SUPPORT_EMAIL_ADDRESS,
        cc: userData.email, // Copia al usuario
        subject: `Solicitud de soporte por bloqueo - ${userData.username}`,
        html: `
          <div style="...">
            <h2>Solicitud de Revisión de Bloqueo</h2>
            <p><strong>Usuario:</strong> ${userData.username}</p>
            <p><strong>ID:</strong> ${userData._id}</p>
            <p><strong>Fecha de bloqueo:</strong> ${new Date(userData.blockDate).toLocaleString(lang)}</p>
            <p><strong>Motivo:</strong> ${userData.blockReason}</p>
            
            <h3>Mensaje del usuario:</h3>
            <div style="background: #f5f5f5; padding: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <a href="${process.env.APP_URL}/admin/users/${userData._id}" style="...">
              Revisar este usuario
            </a>
          </div>
        `
      };
      
      await smtpTransport.sendMail(mailOptions);
    };

    await smtpTransport.sendMail(mailOptions)
    console.log('✅ Solicitud de soporte por bloqueo enviada correctamente.')
  } catch (err) {
    console.error('❌ Error al enviar la solicitud de soporte:', err.message)
    throw err
  }
}

module.exports = {
  sendVerificationMail,
  sendBlockSupportMail
}