const axios = require('axios');

const PTERO_URL = process.env.PTERO_URL; // https://panel.lo.com
const PTERO_API_KEY = process.env.PTERO_API_KEY;
const DEFAULT_NEST = parseInt(process.env.PTERO_NEST_ID) || 1;
const DEFAULT_EGG = parseInt(process.env.PTERO_EGG_ID) || 1;
const DOCKER_IMAGE = process.env.PTERO_DOCKER_IMAGE || 'ghcr.io/pterodactyl/yolks:java_17';
const DEFAULT_ALLOCATION = parseInt(process.env.PTERO_ALLOCATION_ID) || 1;

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
    'UNLIMITED': { ram: 0, disk: 0, cpu: 0 },
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const payload = req.body;
    console.log('Webhook received:', payload);

    // Sesuaikan dengan format webhook Pakasir
    if (!payload || payload.transaction_status !== 'paid' && payload.status !== 'success') {
        return res.status(200).send('Ignored');
    }

    const customerEmail = payload.customer_email;
    const customerName = payload.customer_name;
    const description = payload.description || '';
    const match = description.match(/Panel Pterodactyl (\w+) -/);
    const packageName = match ? match[1] : '1GB';

    const spec = specMap[packageName] || specMap['1GB'];

    try {
        const headers = {
            'Authorization': `Bearer ${PTERO_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json'
        };

        // Cari atau buat user
        const userRes = await axios.get(`${PTERO_URL}/api/application/users?filter[email]=${encodeURIComponent(customerEmail)}`, { headers });
        let userId;
        if (userRes.data.data.length > 0) {
            userId = userRes.data.data[0].attributes.id;
        } else {
            const newUser = {
                email: customerEmail,
                username: customerEmail.split('@')[0],
                first_name: customerName.split(' ')[0],
                last_name: customerName.split(' ').slice(1).join(' ') || 'Customer',
            };
            const createUser = await axios.post(`${PTERO_URL}/api/application/users`, newUser, { headers });
            userId = createUser.data.attributes.id;
        }

        // Buat server
        const serverData = {
            name: `${packageName} Server - ${customerName}`,
            user: userId,
            egg: DEFAULT_EGG,
            docker_image: DOCKER_IMAGE,
            startup: process.env.PTERO_STARTUP || '',
            environment: {},
            limits: {
                memory: spec.ram,
                swap: 0,
                disk: spec.disk,
                io: 500,
                cpu: spec.cpu,
            },
            feature_limits: {
                databases: 1,
                allocations: 1,
                backups: 1,
            },
            allocation: {
                default: DEFAULT_ALLOCATION,
            },
            deploy: {
                locations: [1], // ganti sesuai node location id
                dedicated_ip: false,
                port_range: [],
            },
            start_on_completion: true,
            skip_scripts: false,
        };

        await axios.post(`${PTERO_URL}/api/application/servers`, serverData, { headers });
        res.status(200).send('OK');
    } catch (error) {
        console.error('Auto deploy error:', error.response?.data || error.message);
        res.status(200).send('Error handled');
    }
};
