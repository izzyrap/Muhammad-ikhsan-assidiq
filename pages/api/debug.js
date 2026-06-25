export default function handler(req, res) {
  // Hanya tampilkan info non-sensitif
  const debugInfo = {
    GMAIL_COUNT: process.env.GMAIL_COUNT || '(tidak diatur)',
    GMAIL_1_EXISTS: process.env.GMAIL_1 ? '✅ Ada' : '❌ Tidak ada',
    GMAIL_2_EXISTS: process.env.GMAIL_2 ? '✅ Ada' : '❌ Tidak ada',
    GMAIL_3_EXISTS: process.env.GMAIL_3 ? '✅ Ada' : '❌ Tidak ada',
    GMAIL_1_PREVIEW: process.env.GMAIL_1 ? process.env.GMAIL_1.split(':')[0] + ':****' : '(kosong)',
    GMAIL_2_PREVIEW: process.env.GMAIL_2 ? process.env.GMAIL_2.split(':')[0] + ':****' : '(kosong)',
    GMAIL_3_PREVIEW: process.env.GMAIL_3 ? process.env.GMAIL_3.split(':')[0] + ':****' : '(kosong)',
    TARGET_EMAIL: process.env.TARGET_EMAIL || '(tidak diatur)',
    EMAIL_SUBJECT: process.env.EMAIL_SUBJECT || '(tidak diatur)',
    EMAIL_BODY_LENGTH: (process.env.EMAIL_BODY || '').length + ' karakter',
  };
  
  res.status(200).json(debugInfo);
}