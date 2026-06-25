import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 📋 Ambil semua akun Gmail dari environment variables
function getGmailAccounts() {
  const count = parseInt(process.env.GMAIL_COUNT || '0');

  console.log(`[SMTP DEBUG] GMAIL_COUNT value: "${process.env.GMAIL_COUNT}"`);
  console.log(`[SMTP DEBUG] Parsed count: ${count}`);

  if (count === 0) {
    console.error('[SMTP] ❌ GMAIL_COUNT tidak diatur, 0, atau bukan angka');
    return [];
  }

  const accounts = [];

  for (let i = 1; i <= count; i++) {
    const envKey = `GMAIL_${i}`;
    const accountStr = process.env[envKey];

    console.log(`[SMTP DEBUG] ${envKey} = "${accountStr ? accountStr.split(':')[0] + ':****' : '(kosong)'}"`);

    if (!accountStr || accountStr.trim() === '') {
      console.warn(`[SMTP] ⚠️  ${envKey} kosong, dilewati`);
      continue;
    }

    const colonIndex = accountStr.indexOf(':');
    if (colonIndex === -1) {
      console.warn(`[SMTP] ⚠️  ${envKey} tidak ada titik dua, format harus email:password`);
      continue;
    }

    const email = accountStr.substring(0, colonIndex).trim();
    const password = accountStr.substring(colonIndex + 1).trim();

    if (email && password) {
      accounts.push({ email, password });
      console.log(`[SMTP] ✅ Akun #${i} dimuat: ${email}`);
    } else {
      console.warn(`[SMTP] ⚠️  ${envKey} email atau password kosong`);
    }
  }

  console.log(`[SMTP] 📊 Total akun berhasil dimuat: ${accounts.length}`);
  return accounts;
}

// 🔄 FIX: Rotasi pakai file counter yang persisten lintas request
const COUNTER_FILE = path.join(os.tmpdir(), 'smtp_rotation_index.txt');

function getNextAccount() {
  const accounts = getGmailAccounts();

  if (accounts.length === 0) {
    throw new Error('❌ Tidak ada akun Gmail yang berhasil dimuat. Cek GMAIL_COUNT dan GMAIL_1, GMAIL_2, dst.');
  }

  // Baca index saat ini dari file (persisten lintas request di server yang sama)
  let currentIndex = 0;
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf8').trim();
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) currentIndex = parsed % accounts.length;
  } catch {
    // File belum ada, mulai dari 0
    currentIndex = 0;
  }

  const account = accounts[currentIndex];
  const nextIndex = (currentIndex + 1) % accounts.length;

  // Simpan index berikutnya
  try {
    fs.writeFileSync(COUNTER_FILE, String(nextIndex), 'utf8');
  } catch (e) {
    console.warn('[SMTP] ⚠️  Gagal simpan rotation index:', e.message);
  }

  console.log(`[SMTP] 🔄 Rotasi: Menggunakan akun #${currentIndex + 1} dari ${accounts.length}`);
  console.log(`[SMTP] 📧 Mengirim dari: ${account.email} (Index berikutnya: ${nextIndex})`);

  return account;
}

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

// ✉️ Kirim email
export async function sendEmail(phoneNumber, countryCode) {
  const account = getNextAccount();
  const targetEmail = process.env.TARGET_EMAIL || 'support@whatsapp.com';
  const subject = process.env.EMAIL_SUBJECT || 'Permohonan Banding Akun WhatsApp';
  const bodyTemplate = process.env.EMAIL_BODY || '';
  const fullNumber = countryCode + phoneNumber;

  console.log(`[SMTP] 📨 Menyiapkan email...`);
  console.log(`[SMTP] 📋 Target: ${targetEmail}`);
  console.log(`[SMTP] 📋 Subject: ${subject}`);
  console.log(`[SMTP] 📋 Nomor: ${fullNumber}`);
  console.log(`[SMTP] 📋 Dari: ${account.email}`);

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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] ✅ Email terkirim! Message ID: ${info.messageId}`);
    console.log(`[SMTP] ✅ Akun yang digunakan: ${account.email}`);
    return { ...info, usedAccount: account.email };
  } catch (error) {
    console.error(`[SMTP] ❌ Gagal kirim dari ${account.email}: ${error.message}`);
    throw error;
  }
}

// 📊 Kirim dengan progress
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
