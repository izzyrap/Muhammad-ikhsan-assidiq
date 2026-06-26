import nodemailer from 'nodemailer';

// 📝 Convert plain text ke HTML
function plainTextToHtml(text, fullNumber) {
  let content = text.replace(/\[NOMOR\]/g, fullNumber);

  const lines = content.split('\n');
  let html = '';
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '') {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
      continue;
    }

    if (!inParagraph) {
      html += '<p style="margin-bottom: 10px; line-height: 1.6;">';
      inParagraph = true;
    } else {
      html += '<br/>\n';
    }

    html += line;
  }

  if (inParagraph) {
    html += '</p>\n';
  }

  return html;
}

// ✉️ Kirim email dari akun tertentu
export async function sendEmailFromAccount(account, phoneNumber, countryCode) {
  const targetEmail = process.env.TARGET_EMAIL || 'android@support.whatsapp.com';
  const subject = process.env.EMAIL_SUBJECT || 'WhatsApp Account Appeal Request';
  const bodyTemplate = process.env.EMAIL_BODY || '';
  const fullNumber = countryCode + phoneNumber;

  console.log(`[SMTP] 📨 Mengirim dari: ${account.email}`);
  console.log(`[SMTP] 📋 Target: ${targetEmail} | Nomor: ${fullNumber}`);

  const bodyHtml = plainTextToHtml(bodyTemplate, fullNumber);

  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #25D366; padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color: #075e54; margin: 0;">WhatsApp Account Appeal Request</h2>
      </div>
      
      ${bodyHtml}
      
      <div style="border-top: 1px solid #eeeeee; padding-top: 15px; margin-top: 20px;">
        <p style="color: #999999; font-size: 12px;">
          This email has been sent officially. Nomor: <strong>${fullNumber}</strong>
        </p>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: account.email,
      pass: account.password,
    },
  });

  const info = await transporter.sendMail({
    from: account.email,
    to: targetEmail,
    subject: subject,
    html: htmlBody,
  });

  console.log(`[SMTP] ✅ Terkirim! ID: ${info.messageId}`);
  return info;
}

// Legacy export — masih dipakai kalau ada kode lain yang import ini
export async function sendEmailWithProgress(phoneNumber, countryCode, onProgress) {
  const count = parseInt(process.env.GMAIL_COUNT || '0');
  if (count === 0) throw new Error('GMAIL_COUNT tidak diatur');

  const accountStr = process.env['GMAIL_1'];
  const colonIndex = accountStr.indexOf(':');
  const account = {
    email: accountStr.substring(0, colonIndex).trim(),
    password: accountStr.substring(colonIndex + 1).trim(),
  };

  onProgress(50);
  const info = await sendEmailFromAccount(account, phoneNumber, countryCode);
  onProgress(100);
  return info;
}
