const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, email, package: pkg, amount } = req.body;
    if (!name || !email || !pkg || !amount) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;
    const PAKASIR_BASE_URL = process.env.PAKASIR_BASE_URL || 'https://api.pakasir.com';

    try {
        const payload = {
            amount: amount,
            customer_name: name,
            customer_email: email,
            callback_url: `${req.headers.origin}/api/webhook`,
            return_url: `${req.headers.origin}`,
            description: `Panel Pterodactyl ${pkg} - ${name}`,
        };

        const response = await axios.post(`${PAKASIR_BASE_URL}/api/v1/transaction`, payload, {
            headers: {
                'Authorization': `Bearer ${PAKASIR_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;
        if (data.status === 'success' && data.qr_string) {
            return res.json({
                success: true,
                transaction_id: data.transaction_id,
                qr_string: data.qr_string, // Pakasir biasanya kirim qr_string bukan qr_code_url
            });
        } else {
            return res.json({ success: false, message: data.message || 'Gagal membuat transaksi' });
        }
    } catch (error) {
        console.error('Pakasir error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
