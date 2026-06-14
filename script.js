document.addEventListener('DOMContentLoaded', () => {
    const priceMap = {
        '1GB': 500,
        '2GB': 1000,
        '3GB': 1500,
        '4GB': 2000,
        '5GB': 2500,
        '6GB': 3000,
        '7GB': 3500,
        '8GB': 4000,
        '9GB': 4500,
        '10GB': 5000,
        'UNLIMITED': 10000
    };

    const specs = {
        '1GB': { ram: '1 GB', storage: '10 GB SSD', cpu: '50%' },
        '2GB': { ram: '2 GB', storage: '20 GB SSD', cpu: '100%' },
        '3GB': { ram: '3 GB', storage: '30 GB SSD', cpu: '150%' },
        '4GB': { ram: '4 GB', storage: '40 GB SSD', cpu: '200%' },
        '5GB': { ram: '5 GB', storage: '50 GB SSD', cpu: '250%' },
        '6GB': { ram: '6 GB', storage: '60 GB SSD', cpu: '300%' },
        '7GB': { ram: '7 GB', storage: '70 GB SSD', cpu: '350%' },
        '8GB': { ram: '8 GB', storage: '80 GB SSD', cpu: '400%' },
        '9GB': { ram: '9 GB', storage: '90 GB SSD', cpu: '450%' },
        '10GB': { ram: '10 GB', storage: '100 GB SSD', cpu: '500%' },
        'UNLIMITED': { ram: 'Unlimited', storage: 'Unlimited', cpu: 'Unlimited' }
    };

    // Render produk
    const productsGrid = document.querySelector('.products-grid');
    const packageSelect = document.getElementById('packageSelect');

    for (const [pkg, price] of Object.entries(priceMap)) {
        const isUnlimited = pkg === 'UNLIMITED';
        const card = document.createElement('div');
        card.className = `product-card ${isUnlimited ? 'featured' : ''}`;
        card.innerHTML = `
            ${isUnlimited ? '<span class="badge">★ BEST</span>' : ''}
            <h3>${pkg}</h3>
            <ul>
                <li>RAM <span>${specs[pkg].ram}</span></li>
                <li>Storage <span>${specs[pkg].storage}</span></li>
                <li>CPU <span>${specs[pkg].cpu}</span></li>
            </ul>
            <div class="price-tag">Rp ${price.toLocaleString('id-ID')} <small>/bln</small></div>
            <button class="buy-btn" data-package="${pkg}">BELI</button>
        `;
        productsGrid.appendChild(card);

        // Tambah opsi select
        const option = document.createElement('option');
        option.value = pkg;
        option.textContent = `${pkg} - Rp ${price.toLocaleString('id-ID')}`;
        packageSelect.appendChild(option);
    }

    // Tombol BELI di card
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pkg = btn.dataset.package;
            document.getElementById('packageSelect').value = pkg;
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Form order
    const form = document.getElementById('orderForm');
    const qrResult = document.getElementById('qrResult');
    const qrContainer = document.getElementById('qrcode');
    const txIdSpan = qrResult.querySelector('.tx-id');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const pkg = document.getElementById('packageSelect').value;
        const amount = priceMap[pkg];

        if (!name || !email || !pkg) {
            alert('Isi semua field!');
            return;
        }

        try {
            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, package: pkg, amount })
            });
            const data = await res.json();
            if (data.success) {
                // Render QR dari qr_string
                qrContainer.innerHTML = ''; // clear
                new QRCode(qrContainer, {
                    text: data.qr_string,
                    width: 200,
                    height: 200,
                    colorDark: "#00ffff",
                    colorLight: "#0a0a0a",
                    correctLevel: QRCode.CorrectLevel.H
                });
                txIdSpan.textContent = `TX_ID: ${data.transaction_id}`;
                qrResult.classList.remove('hidden');
                qrResult.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Gagal: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Error jaringan');
        }
    });
});
