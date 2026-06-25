import nodemailer from 'nodemailer';

// Index buat rotasi akun Gmail
let currentIndex = 0;

// Ambil daftar akun Gmail dari environment variable
function getGmailAccounts() {
  const accountsStr = process.env.GMAIL_ACCOUNTS || '';
  if (!accountsStr) return [];
  
  return accountsStr.split(',').map(acc => {
    const [email, password] = acc.split(':');
    return { 
      email: email?.trim(), 
      password: password?.trim() 
    };
  }).filter(acc => acc.email && acc.password);
}

// Rotasi akun Gmail berikutnya
function getNextAccount() {
  const accounts = getGmailAccounts();
  if (accounts.length === 0) {
    throw new Error('Tidak ada akun Gmail yang dikonfigurasi');
  }
  const account = accounts[currentIndex];
  currentIndex = (currentIndex + 1) % accounts.length;
  return account;
}

// Convert plain text ke HTML sederhana
function plainTextToHtml(text, fullNumber) {
  // Ganti placeholder [NOMOR] dengan nomor telepon lengkap
  let content = text.replace(/\[NOMOR\]/g, fullNumber);
  
  // Pisah per baris
  const lines = content.split('\n');
  let html = '';
  let inParagraph = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Baris kosong -> tutup paragraf
    if (line === '') {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
      continue;
    }
    
    // Baris baru -> buka paragraf baru
    if (!inParagraph) {
      html += '<p style="margin-bottom: 10px; line-height: 1.6;">';
      inParagraph = true;
    } else {
      // Tambah line break dalam paragraf yang sama
      html += '<br/>\n';
    }
    
    html += line;
  }
  
  // Tutup paragraf terakhir
  if (inParagraph) {
    html += '</p>\n';
  }
  
  return html;
}

// Kirim email dengan template plain text dari environment
export async function sendEmail(phoneNumber, countryCode) {
  const account = getNextAccount();
  const targetEmail = process.env.TARGET_EMAIL || 'support@whatsapp.com';
  const subject = process.env.EMAIL_SUBJECT || 'Permohonan Banding Akun WhatsApp';
  const bodyTemplate = process.env.EMAIL_BODY || '';
  const fullNumber = countryCode + phoneNumber;

  // Convert plain text ke HTML
  const bodyHtml = plainTextToHtml(bodyTemplate, fullNumber);

  // Bungkus dengan template HTML dasar
  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #25D366; padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color: #075e54; margin: 0;">Permohonan Banding Akun WhatsApp</h2>
      </div>
      
      ${bodyHtml}
      
      <div style="border-top: 1px solid #eeeeee; padding-top: 15px; margin-top: 20px;">
        <p style="color: #999999; font-size: 12px;">
          Email ini dikirim melalui sistem otomatis. Nomor terlampir: <strong>${fullNumber}</strong>
        </p>
      </div>
    </div>
  `;

  // Konfigurasi transporter Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: account.email,
      pass: account.password,
    },
  });

  // Opsi email
  const mailOptions = {
    from: account.email,
    to: targetEmail,
    subject: subject,
    html: htmlBody,
  };

  // Kirim email
  return transporter.sendMail(mailOptions);
}

// Kirim email dengan simulasi progress (buat frontend)
export async function sendEmailWithProgress(phoneNumber, countryCode, onProgress) {
  return new Promise((resolve, reject) => {
    let progress = 0;
    
    // Simulasi progress 0-90%
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress > 90) {
        progress = 90;
        clearInterval(interval);
      }
      onProgress(Math.min(progress, 90));
    }, 400);
    
    // Kirim email beneran
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
