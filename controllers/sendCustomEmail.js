// utils/sendCustomEmail.js
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const { OAuth2 } = google.auth

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS
} = process.env

const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
)

const sendCustomEmail = async (to, subject, htmlContent) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })

    const accessToken = await oauth2Client.getAccessToken()

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

    const mailOptions = {
      from: SENDER_EMAIL_ADDRESS,
      to,
      subject,
      html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 30px; font-size: 110%;">
          <h2 style="color: teal;">${subject}</h2>
          <p style="white-space: pre-line;">${htmlContent}</p>
        </div>
      `
    }

    await smtpTransport.sendMail(mailOptions)
    console.log(`✅ Correo enviado a ${to}`)
  } catch (err) {
    console.error('❌ Error al enviar el correo personalizado:', err.message)
    throw err
  }
}

module.exports = sendCustomEmail
