import { sendEmailFromAccount } from '../../lib/smtp';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { phoneNumber, countryCode, token } = req.body;

  if (!phoneNumber || !countryCode) {
    return res.status(400).json({ success: false, message: 'Nomor telepon dan kode negara wajib diisi' });
  }
  if (!token || token.trim() === '') {
    return res.status(400).json({ success: false, message: 'Access token wajib diisi' });
  }
  if (token !== process.env.ACCESS_TOKEN) {
    return res.status(403).json({ success: false, message: 'Access token tidak valid' });
  }
  if (!/^\d{6,15}$/.test(phoneNumber)) {
    return res.status(400).json({ success: false, message: 'Format nomor telepon tidak valid' });
  }

  // --- Ambil semua akun pengirim ---
  const senderCount = parseInt(process.env.GMAIL_COUNT || '0');
  if (senderCount === 0) {
    return res.status(500).json({ success: false, message: 'GMAIL_COUNT tidak diatur' });
  }

  const senders = [];
  for (let i = 1; i <= senderCount; i++) {
    const accountStr = process.env[`GMAIL_${i}`];
    if (!accountStr) continue;
    const colonIndex = accountStr.indexOf(':');
    if (colonIndex === -1) continue;
    senders.push({
      email: accountStr.substring(0, colonIndex).trim(),
      password: accountStr.substring(colonIndex + 1).trim(),
    });
  }

  if (senders.length === 0) {
    return res.status(500).json({ success: false, message: 'Tidak ada akun Gmail valid' });
  }

  // --- Ambil semua target email ---
  const targetCount = parseInt(process.env.TARGET_EMAIL_COUNT || '0');
  let targets = [];

  if (targetCount > 0) {
    for (let i = 1; i <= targetCount; i++) {
      const t = process.env[`TARGET_EMAIL_${i}`];
      if (t && t.trim()) targets.push(t.trim());
    }
  }

  // Fallback ke TARGET_EMAIL lama
  if (targets.length === 0) {
    const fallback = process.env.TARGET_EMAIL;
    if (fallback && fallback.trim()) targets.push(fallback.trim());
  }

  if (targets.length === 0) {
    return res.status(500).json({ success: false, message: 'Tidak ada target email yang diatur' });
  }

  console.log(`[SEND] 📬 ${senders.length} pengirim, ${targets.length} target per pengirim`);

  const results = [];
  const errors = [];

  // --- Loop pengirim secara berurutan ---
  for (let s = 0; s < senders.length; s++) {
    const sender = senders[s];
    console.log(`[SEND] 📤 Akun ${s + 1}/${senders.length}: ${sender.email} → ${targets.length} target sekaligus`);

    // Kirim ke semua target secara PARALEL dari 1 akun
    const promises = targets.map((target) =>
      sendEmailFromAccount(sender, phoneNumber, countryCode, target)
        .then((info) => {
          console.log(`[SEND] ✅ ${sender.email} → ${target}`);
          results.push({ from: sender.email, to: target, messageId: info.messageId });
        })
        .catch((error) => {
          console.error(`[SEND] ❌ ${sender.email} → ${target}: ${error.message}`);
          errors.push({ from: sender.email, to: target, error: error.message });
        })
    );

    // Tunggu semua target dari akun ini selesai sebelum lanjut ke akun berikutnya
    await Promise.all(promises);
    console.log(`[SEND] ✔️  Akun ${s + 1} selesai, lanjut ke akun berikutnya...`);
  }

  if (results.length === 0) {
    return res.status(500).json({
      success: false,
      message: 'Semua pengiriman gagal',
      errors,
    });
  }

  return res.status(200).json({
    success: true,
    message: `Akun Berhasil ${results.length} Di ${senders.length * targets.length} (${senders.length} Eksekusi ${targets.length} Bro)`,
    sent: results,
    failed: errors,
  });
}
