import { sendEmailFromAccount } from '../../lib/smtp';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { phoneNumber, countryCode, token } = req.body;

  // Validasi input
  if (!phoneNumber || !countryCode) {
    return res.status(400).json({ success: false, message: 'Nomor telepon dan kode negara wajib diisi' });
  }

  if (!token || token.trim() === '') {
    return res.status(400).json({ success: false, message: 'Access token wajib diisi' });
  }

  // Verifikasi token
  const validToken = process.env.ACCESS_TOKEN;
  if (token !== validToken) {
    return res.status(403).json({ success: false, message: 'Access token tidak valid' });
  }

  // Validasi format nomor
  if (!/^\d{6,15}$/.test(phoneNumber)) {
    return res.status(400).json({ success: false, message: 'Format nomor telepon tidak valid' });
  }

  // Ambil semua akun dari env
  const count = parseInt(process.env.GMAIL_COUNT || '0');
  if (count === 0) {
    return res.status(500).json({ success: false, message: 'GMAIL_COUNT tidak diatur' });
  }

  const results = [];
  const errors = [];

  // Loop kirim dari setiap akun satu per satu
  for (let i = 1; i <= count; i++) {
    const accountStr = process.env[`GMAIL_${i}`];
    if (!accountStr) continue;

    const colonIndex = accountStr.indexOf(':');
    if (colonIndex === -1) continue;

    const email = accountStr.substring(0, colonIndex).trim();
    const password = accountStr.substring(colonIndex + 1).trim();

    try {
      const info = await sendEmailFromAccount({ email, password }, phoneNumber, countryCode);
      console.log(`[${i}/${count}] ✅ Terkirim dari ${email} | ID: ${info.messageId}`);
      results.push({ account: email, messageId: info.messageId });
    } catch (error) {
      console.error(`[${i}/${count}] ❌ Gagal dari ${email}: ${error.message}`);
      errors.push({ account: email, error: error.message });
    }
  }

  if (results.length === 0) {
    return res.status(500).json({
      success: false,
      message: 'Semua akun gagal mengirim email',
      errors,
    });
  }

  return res.status(200).json({
    success: true,
    message: `Email berhasil dikirim dari ${results.length} akun`,
    sent: results,
    failed: errors,
  });
}
