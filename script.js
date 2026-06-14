document.addEventListener('DOMContentLoaded', () => {
    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            navLinks.classList.remove('active');
        });
    });

    // Tombol "Beli" pada card produk
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', async () => {
            const package = btn.dataset.package;
            const price = btn.dataset.price;
            // Isi form otomatis (opsional)
            document.getElementById('packageSelect').value = package;
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            // Bisa juga langsung trigger order dengan modal input nama/email
            // Di sini kita biarkan user isi form dulu
        });
    });

    // Form Order
    const orderForm = document.getElementById('orderForm');
    const paymentResult = document.getElementById('paymentResult');
    const qrModal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrContainer');
    const transactionIdSpan = document.getElementById('transactionId');
    const closeModal = document.querySelector('.close');

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const packageName = document.getElementById('packageSelect').value;

        if (!name || !email || !packageName) {
            alert('Mohon isi semua field.');
            return;
        }

        // Price mapping
        const priceMap = {
            '1GB': 5000, '2GB': 10000, '3GB': 15000, '4GB': 20000,
            '5GB': 25000, '6GB': 30000, '7GB': 35000, '8GB': 40000,
            '9GB': 45000, '10GB': 50000, 'UNLIMITED': 100000
        };
        const amount = priceMap[packageName];

        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, package: packageName, amount })
            });

            const data = await response.json();
            if (data.success) {
                // Tampilkan QR Code di modal
                qrContainer.innerHTML = `<img src="${data.qr_code_url}" alt="QR Code">`;
                transactionIdSpan.textContent = `Transaction ID: ${data.transaction_id}`;
                qrModal.classList.remove('hidden');
            } else {
                alert('Gagal membuat transaksi: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan jaringan.');
        }
    });

    closeModal.addEventListener('click', () => {
        qrModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === qrModal) qrModal.classList.add('hidden');
    });
});