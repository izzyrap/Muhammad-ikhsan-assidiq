const axios = require('axios');

// Konfigurasi Pterodactyl
const PTERO_URL = process.env.PTERO_URL; // https://panel.lo.com
const PTERO_API_KEY = process.env.PTERO_API_KEY; // Application API key
const DEFAULT_NEST = parseInt(process.env.PTERO_NEST_ID) || 1; // Nest ID (biasanya 1 untuk Minecraft/Game, sesuaikan)
const DEFAULT_EGG = parseInt(process.env.PTERO_EGG_ID) || 1; // Egg ID
const DEFAULT_STARTUP = process.env.PTERO_STARTUP || ''; 
const DOCKER_IMAGE = process.env.PTERO_DOCKER_IMAGE || 'ghcr.io/pterodactyl/yolks:java_17';
const DEFAULT_ALLOCATION = parseInt(process.env.PTERO_ALLOCATION_ID) || 1; // Allocation ID default

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    // Pakasir biasanya mengirimkan data transaksi saat status berubah menjadi "settled"/"paid"
    const payload = req.body;
    console.log('Webhook received:', payload);

    // Validasi sederhana - sesuaikan dengan struktur webhook Pakasir
    if (!payload || payload.status !== 'success' && payload.transaction_status !== 'paid') {
        return res.status(200).send('Ignored');
    }

    // Ambil informasi penting
    const customerEmail = payload.customer_email;
    const customerName = payload.customer_name;
    const description = payload.description; // mengandung nama paket

    // Ekstrak nama paket dari deskripsi, asumsi format "Panel Pterodactyl 2GB - Nama"
    let packageName = 'Unknown';
    const match = description.match(/Panel Pterodactyl (\w+) -/);
    if (match) packageName = match[1];

    // Tentukan RAM, DISK, CPU berdasarkan paket
    const specMap = {
        '1GB': { ram: 1024, disk: 10240, cpu: 50 },
        '2GB': { ram: 2048, disk: 20480, cpu: 100 },
        '3GB': { ram: 3072, disk: 30720, cpu: 150 },
        '4GB': { ram: 4096, disk: 40960, cpu: 200 },
        '5GB': { ram: 5120, disk: 51200, cpu: 250 },
        '6GB': { ram: 6144, disk: 61440, cpu: 300 },
        '7GB': { ram: 7168, disk: 71680, cpu: 350 },
        '8GB': { ram: 8192, disk: 81920, cpu: 400 },
        '9GB': { ram: 9216, disk: 92160, cpu: 450 },
        '10GB': { ram: 10240, disk: 102400, cpu: 500 },
        'UNLIMITED': { ram: 0, disk: 0, cpu: 0 }, // 0 = unlimited di Pterodactyl (sebenarnya perlu dihandle khusus)
    };

    const spec = specMap[packageName] || { ram: 1024, disk: 10240, cpu: 50 };

    try {
        // 1. Cari atau buat user Pterodactyl berdasarkan email
        const pteroHeaders = {
            'Authorization': `Bearer ${PTERO_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json'
        };

        // Cek apakah user sudah ada
        const userListRes = await axios.get(`${PTERO_URL}/api/application/users?filter[email]=${encodeURIComponent(customerEmail)}`, { headers: pteroHeaders });
        let userId;
        if (userListRes.data.data.length > 0) {
            userId = userListRes.data.data[0].attributes.id;
        } else {
            // Buat user baru
            const newUser = {
                email: customerEmail,
                username: customerEmail.split('@')[0],
                first_name: customerName.split(' ')[0],
                last_name: customerName.split(' ').slice(1).join(' ') || 'Customer',
            };
            const createUserRes = await axios.post(`${PTERO_URL}/api/application/users`, newUser, { headers: pteroHeaders });
            userId = createUserRes.data.attributes.id;
        }

        // 2. Buat server
        const serverData = {
            name: `${packageName} Server - ${customerName}`,
            user: userId,
            egg: DEFAULT_EGG,
            docker_image: DOCKER_IMAGE,
            startup: DEFAULT_STARTUP,
            environment: {}, // bisa diisi environment variables sesuai egg
            limits: {
                memory: spec.ram,
                swap: 0,
                disk: spec.disk,
                io: 500,
                cpu: spec.cpu,
                threads: null
            },
            feature_limits: {
                databases: 1,
                allocations: 1,
                backups: 1
            },
            allocation: {
                default: DEFAULT_ALLOCATION
            },
            deploy: {
                locations: [1], // ID location, sesuaikan
                dedicated_ip: false,
                port_range: []
            },
            start_on_completion: true,
            skip_scripts: false,
            oom_disabled: false
        };

        const createServerRes = await axios.post(`${PTERO_URL}/api/application/servers`, serverData, { headers: pteroHeaders });
        console.log('Server created:', createServerRes.data.attributes.identifier);

        // Kirim notifikasi ke customer (bisa email, Telegram, dll) - opsional
        // Di sini cukup response 200
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error creating server:', error.response?.data || error.message);
        // Tetap kirim 200 agar Pakasir tidak terus retry
        res.status(200).send('Error handled');
    }
};