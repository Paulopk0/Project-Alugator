const nodemailer = require('nodemailer');

/**
 * Envia um email usando SMTP de teste (Ethereal)
 * Para produção, configure um SMTP real (Gmail, SendGrid, etc.)
 */
async function sendEmail(to, subject, text) {
  try {
    // Se variáveis de ambiente SMTP estiverem definidas, use um SMTP real
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    let transporter;
    let usingEthereal = false;

    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465, // true se porta 465
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      try {
        console.log('Verificando conexão SMTP...');
        await transporter.verify();
       
      } catch (verifyErr) {
        console.error('Falha ao verificar conexão SMTP:', verifyErr);
        throw verifyErr;
      }
    } else {
      // Fallback para Ethereal em desenvolvimento (preview URL)
  let testAccount = await nodemailer.createTestAccount();
     transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      usingEthereal = true;
    }
    console.log('Enviando email para:', to);
    // opcional: verificar transporter também para Ethereal
    if (usingEthereal) {
      try {
        await transporter.verify();
  } catch (ethVerifyErr) {
        console.error('Falha ao verificar conexão Ethereal:', ethVerifyErr);
      }
    }
    let info = await transporter.sendMail({
      from: `"Allugator" <${smtpUser || 'noreply@allugator.test'}>`,
      to,
      subject,
      text
    });

    if (usingEthereal) {
      const preview = nodemailer.getTestMessageUrl(info);
      console.log('URL de preview (Ethereal): %s', preview);
    }

    return info;
  } catch (error) {
    console.error('Erro detalhado ao enviar email:', error);
    throw error;
  }
}

module.exports = { sendEmail };