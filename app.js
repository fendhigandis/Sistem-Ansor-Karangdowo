document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. SPA HOLOGRAPHIC ROUTING ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-layer');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
                if(view.id === `view-${target}`) {
                    view.classList.add('active');
                }
            });
        });
    });

    // --- 2. INTELLIGENT 3D TILT ENGINE ---
    // Hanya aktif pada perangkat dengan mouse (PC/Laptop) untuk menghindari lag di HP
    const isHoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (isHoverCapable) {
        const tiltElements = document.querySelectorAll('.tilt-element');
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                
                el.style.transform = `translateZ(0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = `translateZ(0) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            });
            
            el.addEventListener('mouseenter', () => {
                el.style.transition = 'none';
            });
        });
    }

    // --- 3. MODUL LEGALITAS (Persistent LocalStorage) ---
    const formLegalitas = document.getElementById('form-legalitas');
    const listLegalitas = document.getElementById('legalitas-list');
    
    // Inisialisasi DB Legalitas
    let dbDokumen = JSON.parse(localStorage.getItem('siar_dokumen')) || [];

    function renderTabelSK() {
        if(dbDokumen.length === 0) {
            listLegalitas.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#777;">Belum ada arsip SK terdaftar.</td></tr>`;
            return;
        }
        
        listLegalitas.innerHTML = dbDokumen.map((doc, index) => `
            <tr>
                <td style="color:#aaa; font-size:0.85rem;">${doc.waktu}</td>
                <td style="font-weight:bold; color:#fff;">${doc.nama}</td>
                <td style="color:var(--ansor-emerald); font-family:monospace; font-size:1.1rem;">${doc.no}</td>
                <td>
                    <button class="btn-cyber btn-danger" style="padding: 6px 12px; font-size: 0.8rem;" onclick="hapusDokumen(${index})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.hapusDokumen = function(index) {
        if(confirm("Anda yakin ingin menghapus arsip SK ini?")) {
            dbDokumen.splice(index, 1);
            localStorage.setItem('siar_dokumen', JSON.stringify(dbDokumen));
            renderTabelSK();
        }
    };

    formLegalitas.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('doc-name').value;
        const no = document.getElementById('doc-number').value;
        const waktu = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

        dbDokumen.unshift({ waktu, nama, no }); // Tambah di atas
        localStorage.setItem('siar_dokumen', JSON.stringify(dbDokumen));
        
        renderTabelSK();
        formLegalitas.reset();
        
        // Efek Sukses
        const btn = formLegalitas.querySelector('.btn-cyber');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Tersimpan';
        btn.style.background = 'var(--ansor-gold)';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
    
    renderTabelSK(); // Render awal

    // --- 4. MODUL KEPENGURUSAN (Tree Data dengan Foto) ---
    const orgTree = document.getElementById('org-tree');
    const modalPengurus = document.getElementById('modal-pengurus');
    const formPengurus = document.getElementById('form-pengurus');
    const btnTambahPengurus = document.getElementById('btn-tambah-pengurus');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const inputFoto = document.getElementById('pengurus-foto');
    const previewFoto = document.getElementById('preview-foto');
    const uploadSurface = document.getElementById('upload-surface');

    // Default Data yang Kuat & Profesional
    const defaultStruktur = {
        ketua: { id: 1, nama: "Muhamad Efendhi", jabatan: "Ketua Ranting", img: "https://ui-avatars.com/api/?name=Muhamad+Efendhi&background=004d28&color=fff&size=200" },
        wakil: [],
        staff: []
    };

    let strukturDB = JSON.parse(localStorage.getItem('siar_struktur')) || defaultStruktur;

    // Logika Modal
    btnTambahPengurus.addEventListener('click', () => { modalPengurus.classList.add('active'); });
    btnCloseModal.addEventListener('click', () => { modalPengurus.classList.remove('active'); resetFormPengurus(); });
    
    // Tutup modal jika klik di luar area
    modalPengurus.addEventListener('click', (e) => {
        if(e.target === modalPengurus) { modalPengurus.classList.remove('active'); resetFormPengurus(); }
    });

    // Preview Gambar (Dengan proteksi ukuran file)
    let tempImageBase64 = "";
    inputFoto.addEventListener('change', function(e) {
        const file = this.files[0];
        if (file) {
            // Cek ukuran file (Maks 1.5MB agar localStorage tidak penuh)
            if(file.size > 1500000) {
                alert("Ukuran foto terlalu besar! Maksimal 1.5 MB.");
                this.value = ""; return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                tempImageBase64 = event.target.result;
                previewFoto.src = tempImageBase64;
                previewFoto.style.display = 'block';
                uploadSurface.style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    function resetFormPengurus() {
        formPengurus.reset();
        previewFoto.style.display = 'none';
        uploadSurface.style.display = 'block';
        tempImageBase64 = "";
    }

    // Submit Node Pengurus Baru
    formPengurus.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('pengurus-nama').value;
        const jabatan = document.getElementById('pengurus-jabatan').value;
        
        if(!tempImageBase64) { alert("Harap upload foto!"); return; }

        const newNode = { id: Date.now(), nama, jabatan, img: tempImageBase64 };

        if (jabatan === 'Ketua') {
            strukturDB.ketua = newNode;
        } else if (jabatan === 'Wakil') {
            strukturDB.wakil.push(newNode);
        } else {
            strukturDB.staff.push(newNode);
        }

        localStorage.setItem('siar_struktur', JSON.stringify(strukturDB));
        susunBagan();
        
        modalPengurus.classList.remove('active');
        resetFormPengurus();
    });

    // Fungsi Render Node 3D
    function createNode(pengurus, category, index) {
        if(!pengurus) return '';
        const isKetua = category === 'ketua';
        // Tombol hapus tidak muncul untuk Ketua (Kecuali direset total)
        const btnDelete = !isKetua ? `<button class="btn-delete-node" onclick="hapusNode('${category}', ${index})"><i class="fas fa-times"></i></button>` : '';
        
        return `
            <div class="node-hologram">
                ${btnDelete}
                <img src="${pengurus.img}" alt="${pengurus.nama}">
                <div class="nama">${pengurus.nama}</div>
                <div class="jabatan">${pengurus.jabatan}</div>
            </div>
        `;
    }

    function susunBagan() {
        let html = '';
        
        // Tier 1 (Ketua)
        if(strukturDB.ketua) {
            html += `<div class="org-tier">${createNode(strukturDB.ketua, 'ketua', 0)}</div>`;
        }
        
        // Tier 2 (Wakil)
        if(strukturDB.wakil.length > 0) {
            html += `<div class="org-tier">${strukturDB.wakil.map((p, i) => createNode(p, 'wakil', i)).join('')}</div>`;
        }
        
        // Tier 3 (Staff / Divisi)
        if(strukturDB.staff.length > 0) {
            html += `<div class="org-tier">${strukturDB.staff.map((p, i) => createNode(p, 'staff', i)).join('')}</div>`;
        }

        orgTree.innerHTML = html || '<p style="color:#777;">Struktur kosong.</p>';
    }

    // Fungsi Hapus Node
    window.hapusNode = function(category, index) {
        if(confirm("Hapus pengurus ini dari susunan?")) {
            strukturDB[category].splice(index, 1);
            localStorage.setItem('siar_struktur', JSON.stringify(strukturDB));
            susunBagan();
        }
    };

    // Tombol Reset Data
    document.getElementById('btn-reset-struktur').addEventListener('click', () => {
        if(confirm("PERINGATAN! Ini akan mengembalikan struktur ke default awal. Lanjutkan?")) {
            strukturDB = JSON.parse(JSON.stringify(defaultStruktur)); // Deep copy default
            localStorage.setItem('siar_struktur', JSON.stringify(strukturDB));
            susunBagan();
        }
    });

    susunBagan(); // Render awal
});
