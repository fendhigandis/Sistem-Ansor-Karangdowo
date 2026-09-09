document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 0. MESIN OTENTIKASI & RBAC (Role-Based Access)
    // ==========================================
    const loginOverlay = document.getElementById('login-overlay');
    const formLogin = document.getElementById('form-login');
    const loginError = document.getElementById('login-error');
    const btnLogout = document.getElementById('btn-logout');
    
    // Database Akun (Simulasi Backend)
    const userDB = {
        'ketua': { pass: '123', nama: 'Muhamad Efendhi', role: 'superadmin', roleName: 'Super Admin Ranting' },
        'sekretaris': { pass: '123', nama: 'Sahabat Sekretaris', role: 'persuratan', roleName: 'Admin Persuratan' },
        'bendahara': { pass: '123', nama: 'Sahabat Bendahara', role: 'keuangan', roleName: 'Admin Keuangan' }
    };

    function checkAuth() {
        const activeUser = JSON.parse(localStorage.getItem('siar_session'));
        if (activeUser) {
            loginOverlay.classList.remove('active');
            applyRoleUI(activeUser);
        } else {
            loginOverlay.classList.add('active');
        }
    }

    function applyRoleUI(user) {
        document.querySelector('.user-name').textContent = user.nama;
        document.querySelector('.user-role').textContent = user.roleName;
        document.getElementById('avatar-img').src = `https://ui-avatars.com/api/?name=${user.nama}&background=004d28&color=fff`;

        const navItems = document.querySelectorAll('#main-navigation .nav-item');
        let firstVisibleTarget = null;

        navItems.forEach(item => {
            const allowedRoles = item.getAttribute('data-role').split(',');
            if (allowedRoles.includes(user.role)) {
                item.classList.remove('hidden-role');
                if(!firstVisibleTarget) firstVisibleTarget = item;
            } else {
                item.classList.add('hidden-role');
            }
            item.classList.remove('active');
        });

        // Trigger klik otomatis ke menu pertama yang diizinkan
        if(firstVisibleTarget) firstVisibleTarget.click();
    }

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value.toLowerCase();
        const pass = document.getElementById('login-password').value;

        if (userDB[user] && userDB[user].pass === pass) {
            localStorage.setItem('siar_session', JSON.stringify(userDB[user]));
            loginError.style.display = 'none';
            formLogin.reset();
            checkAuth();
        } else {
            loginError.style.display = 'block';
        }
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('siar_session');
        checkAuth();
    });

    checkAuth(); // Jalankan saat aplikasi dimulai

    // ==========================================
    // 1. SPA HOLOGRAPHIC ROUTING
    // ==========================================
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-layer');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Cegah error jika menu hidden diklik paksa
            if(item.classList.contains('hidden-role')) return; 

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

    // ==========================================
    // 2. INTELLIGENT 3D TILT ENGINE
    // ==========================================
    const isHoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (isHoverCapable) {
        const tiltElements = document.querySelectorAll('.tilt-element');
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
                const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
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

    // ==========================================
    // 3. MODUL LEGALITAS (Persistent LocalStorage)
    // ==========================================
    const formLegalitas = document.getElementById('form-legalitas');
    const listLegalitas = document.getElementById('legalitas-list');
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

        dbDokumen.unshift({ waktu, nama, no });
        localStorage.setItem('siar_dokumen', JSON.stringify(dbDokumen));
        renderTabelSK();
        formLegalitas.reset();
        
        const btn = formLegalitas.querySelector('.btn-cyber');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Tersimpan';
        btn.style.background = 'var(--ansor-gold)';
        btn.style.color = '#000';
        setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; btn.style.color = ''; }, 2000);
    });
    
    renderTabelSK();

    // ==========================================
    // 4. MODUL KEPENGURUSAN (Tree Data)
    // ==========================================
    const orgTree = document.getElementById('org-tree');
    const modalPengurus = document.getElementById('modal-pengurus');
    const formPengurus = document.getElementById('form-pengurus');
    const inputFoto = document.getElementById('pengurus-foto');
    const previewFoto = document.getElementById('preview-foto');
    const uploadSurface = document.getElementById('upload-surface');

    const defaultStruktur = {
        ketua: { id: 1, nama: "Muhamad Efendhi", jabatan: "Ketua Ranting", img: "https://ui-avatars.com/api/?name=Muhamad+Efendhi&background=004d28&color=fff&size=200" },
        wakil: [],
        staff: []
    };

    let strukturDB = JSON.parse(localStorage.getItem('siar_struktur')) || defaultStruktur;

    document.getElementById('btn-tambah-pengurus').addEventListener('click', () => modalPengurus.classList.add('active'));
    document.getElementById('btn-close-modal').addEventListener('click', () => { modalPengurus.classList.remove('active'); resetFormPengurus(); });
    
    modalPengurus.addEventListener('click', (e) => {
        if(e.target === modalPengurus) { modalPengurus.classList.remove('active'); resetFormPengurus(); }
    });

    let tempImageBase64 = "";
    inputFoto.addEventListener('change', function(e) {
        const file = this.files[0];
        if (file) {
            if(file.size > 1500000) { alert("Ukuran foto maksimal 1.5 MB."); this.value = ""; return; }
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

    formPengurus.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('pengurus-nama').value;
        const jabatan = document.getElementById('pengurus-jabatan').value;
        if(!tempImageBase64) { alert("Harap upload foto!"); return; }

        const newNode = { id: Date.now(), nama, jabatan, img: tempImageBase64 };
        if (jabatan === 'Ketua') strukturDB.ketua = newNode;
        else if (jabatan === 'Wakil') strukturDB.wakil.push(newNode);
        else strukturDB.staff.push(newNode);

        localStorage.setItem('siar_struktur', JSON.stringify(strukturDB));
        susunBagan();
        modalPengurus.classList.remove('active');
        resetFormPengurus();
    });

    function createNode(pengurus, category, index) {
        if(!pengurus) return '';
        const isKetua = category === 'ketua';
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
        if(strukturDB.ketua) html += `<div class="org-tier">${createNode(strukturDB.ketua, 'ketua', 0)}</div>`;
        if(strukturDB.wakil.length > 0) html += `<div class="org-tier">${strukturDB.wakil.map((p, i) => createNode(p, 'wakil', i)).join('')}</div>`;
        if(strukturDB.staff.length > 0) html += `<div class="org-tier">${strukturDB.staff.map((p, i) => createNode(p, 'staff', i)).join('')}</div>`;
        orgTree.innerHTML = html || '<p style="color:#777;">Struktur kosong.</p>';
    }

    window.hapusNode = function(category, index) {
        if(confirm("Hapus pengurus ini dari susunan?")) {
            strukturDB[category].splice(index, 1);
            localStorage.setItem('siar_struktur', JSON.stringify(strukturDB));
            susunBagan();
        }
    };

    document.getElementById('btn-reset-struktur').addEventListener('click', () => {
        if(confirm("PERINGATAN! Ini akan mengembalikan struktur ke default awal. Lanjutkan?")) {
            strukturDB = JSON.parse(JSON.stringify(defaultStruktur));
            localStorage.setItem('siar_struktur', JSON.stringify(strukturDB));
            susunBagan();
        }
    });

    susunBagan();
});
