import nodemailer from 'nodemailer';

let currentIndex = 0;

// Ambil daftar akun Gmail dari variable terpisah
function getGmailAccounts() {
  const count = parseInt(process.env.GMAIL_COUNT || '0');
  if (count === 0) {
    console.error('[SMTP] GMAIL_COUNT tidak diatur atau 0');
    return [];
  }
  
  const accounts = [];
  
  for (let i = 1; i <= count; i++) {
    const accountStr = process.env[`GMAIL_${i}`] || '';
    if (!accountStr) {
      console.warn(`[SMTP] GMAIL_${i} kosong, skip`);
      continue;
    }
    
    const colonIndex = accountStr.indexOf(':');
    if (colonIndex === -1) {
      console.warn(`[SMTP] GMAIL_${i} format salah (tidak ada titik dua), skip`);
      continue;
    }
    
    const email = accountStr.substring(0, colonIndex).trim();
    const password = accountStr.substring(colonIndex + 1).trim();
    
    if (email && password) {
      accounts.push({ email, password });
      console.log(`[SMTP] Akun ${i} loaded: ${email}`);
    }
  }
  
  return accounts;
}

// Rotasi akun berikutnya
function getNextAccount() {
  const accounts = getGmailAccounts();
  
  if (accounts.length === 0) {
    throw new Error('Tidak ada akun Gmail yang berhasil dimuat');
  }
  
  console.log(`[SMTP] Total akun: ${accounts.length}, Index: ${currentIndex}`);
  
  const account = accounts[currentIndex];
  currentIndex = (currentIndex + 1) % accounts.length;
  
  console.log(`[SMTP] Kirim dari: ${account.email}, Index berikutnya: ${currentIndex}`);
  
  return account;
}

// Convert plain text ke HTML
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

// Kirim email
export async function sendEmail(phoneNumber, countryCode) {
  const account = getNextAccount();
  const targetEmail = process.env.TARGET_EMAIL || 'support@whatsapp.com';
  const subject = process.env.EMAIL_SUBJECT || 'Permohonan Banding Akun WhatsApp';
  const bodyTemplate = process.env.EMAIL_BODY || '';
  const fullNumber = countryCode + phoneNumber;

  const bodyHtml = plainTextToHtml(bodyTemplate, fullNumber);

  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #25D366; padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color: #075e54; margin: 0;">Permohonan Banding Akun WhatsApp</h2>
      </div>
      
      ${bodyHtml}
      
      <div style="border-top: 1px solid #eeeeee; padding-top: 15px; margin-top: 20px;">
        <p style="color: #999999; font-size: 12px;">
          Email ini dikirim melalui sistem otomatis. Nomor: <strong>${fullNumber}</strong>
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

  const mailOptions = {
    from: account.email,
    to: targetEmail,
    subject: subject,
    html: htmlBody,
  };

  return transporter.sendMail(mailOptions);
}

// Kirim dengan progress
export async function sendEmailWithProgress(phoneNumber, countryCode, onProgress) {
  return new Promise((resolve, reject) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress > 90) {
        progress = 90;
        clearInterval(interval);
      }
      onProgress(Math.min(progress, 90));
    }, 400);
    
    sendEmail(phoneNumber, countryCode)
      .then((info) => {
        clearInterval(interval);
        onProgress(100);
        resolve(info);
      })
      .catch((err) => {
        clearInterval(interval);
        reject(err);
      });
  });
}
