import { sendEmailWithProgress } from '../../lib/smtp';

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

  try {
    // Kirim email
    const info = await sendEmailWithProgress(phoneNumber, countryCode, (progress) => {
      // Progress tidak bisa dikirim real-time dengan REST biasa,
      // tapi kita simulasikan di client. Di server langsung eksekusi.
    });

    console.log(`Email terkirim: ${info.messageId} | Nomor: ${countryCode}${phoneNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Email banding berhasil dikirim ke WhatsApp Support',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim email. Silakan coba lagi nanti.',
      error: error.message,
    });
  }
}
