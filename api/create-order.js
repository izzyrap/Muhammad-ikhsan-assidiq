const axios = require('axios');

// Konfigurasi Pakasir - ambil dari environment variables
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;
const PAKASIR_BASE_URL = process.env.PAKASIR_BASE_URL || 'https://api.pakasir.com';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, package: packageName, amount } = req.body;

    if (!name || !email || !packageName || !amount) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    try {
        // Panggil API Pakasir untuk buat transaksi QRIS
        const payload = {
            amount: amount,
            customer_name: name,
            customer_email: email,
            callback_url: `${req.headers.origin}/api/webhook`, // webhook URL
            return_url: `${req.headers.origin}`,
            description: `Panel Pterodactyl ${packageName} - ${name}`,
        };

        const response = await axios.post(`${PAKASIR_BASE_URL}/api/v1/transaction`, payload, {
            headers: {
                'Authorization': `Bearer ${PAKASIR_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;
        if (data.status === 'success') {
            return res.json({
                success: true,
                transaction_id: data.transaction_id,
                qr_code_url: data.qr_code_url, // URL gambar QR
            });
        } else {
            return res.json({ success: false, message: data.message || 'Failed' });
        }
    } catch (error) {
        console.error('Error creating transaction:', error.response?.data || error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
