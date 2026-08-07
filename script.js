// Simulação de dados vindos de um JSON (API)
const dadosMercado = [
    {
        "titulo": "Oferta Especial",
        "subtitulo": "Produtos em promoção",
        "badge": "-20%",
        "cor": "bg-green"
    },
    {
        "titulo": "Novidades",
        "subtitulo": "Últimos lançamentos",
        "badge": "Novo",
        "cor": "bg-blue"
    }
];

const API_BASE_URL = 'http://localhost:3000';
let bezerrosCache = [];
let bezerroPhotoBase64 = '';
let currentEditingBezerroId = null;
let currentEditingBezerroPhoto = '';

function carregarMercado() {
    const listaContainer = document.getElementById('lista-mercado');
    if (!listaContainer) {
        return;
    }

    listaContainer.innerHTML = '';

    dadosMercado.forEach(item => {
        const div = document.createElement('div');
        div.className = 'mercado-item';

        div.innerHTML = `
            <div>
                <strong>${item.titulo}</strong><br>
                <small style="color: #666;">${item.subtitulo}</small>
            </div>
            <span class="badge ${item.cor}">${item.badge}</span>
        `;

        listaContainer.appendChild(div);
    });
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function abrirLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function resetBezerroForm() {
    const form = document.getElementById('bezerroForm');
    if (form) {
        form.reset();
    }

    currentEditingBezerroId = null;
    currentEditingBezerroPhoto = '';
    bezerroPhotoBase64 = '';

    const title = document.getElementById('modalTitle');
    if (title) {
        title.textContent = 'Adicionar Bezerro';
    }

    const submitButton = document.getElementById('submitBezerroBtn');
    if (submitButton) {
        submitButton.textContent = 'Salvar Bezerro';
    }

    const preview = document.getElementById('photoPreview');
    if (preview) {
        preview.style.backgroundImage = '';
        preview.textContent = 'Clique para selecionar uma imagem';
    }
}

function openBezerroForm(bezerro = null) {
    const modal = document.getElementById('bezerroModal');
    if (!modal) {
        return;
    }

    resetBezerroForm();

    if (bezerro) {
        currentEditingBezerroId = bezerro.id;
        currentEditingBezerroPhoto = bezerro.imagem_base64 || '';
        bezerroPhotoBase64 = bezerro.imagem_base64 || '';

        document.getElementById('bezerroId').value = bezerro.id;
        document.getElementById('nomeBezerro').value = bezerro.nome || '';
        document.getElementById('racaBezerro').value = bezerro.raca || '';
        document.getElementById('pesoBezerro').value = bezerro.peso || '';
        document.getElementById('idadeBezerro').value = bezerro.idade || '';

        const title = document.getElementById('modalTitle');
        if (title) {
            title.textContent = 'Editar Bezerro';
        }

        const submitButton = document.getElementById('submitBezerroBtn');
        if (submitButton) {
            submitButton.textContent = 'Atualizar Bezerro';
        }

        const preview = document.getElementById('photoPreview');
        if (preview && bezerro.imagem_base64) {
            preview.style.backgroundImage = `url(${bezerro.imagem_base64})`;
            preview.textContent = '';
        }
    }

    modal.classList.add('active');
}

function closeBezerroForm() {
    const modal = document.getElementById('bezerroModal');
    if (modal) {
        modal.classList.remove('active');
    }
    resetBezerroForm();
}

function handleBezerroPhotoUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('photoPreview');

    if (!file) {
        bezerroPhotoBase64 = currentEditingBezerroPhoto || '';
        if (preview) {
            if (bezerroPhotoBase64) {
                preview.style.backgroundImage = `url(${bezerroPhotoBase64})`;
                preview.textContent = '';
            } else {
                preview.style.backgroundImage = '';
                preview.textContent = 'Clique para selecionar uma imagem';
            }
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        bezerroPhotoBase64 = reader.result;
        if (preview) {
            preview.style.backgroundImage = `url(${bezerroPhotoBase64})`;
            preview.textContent = '';
        }
    };

    reader.readAsDataURL(file);
}

async function loadBezerros() {
    const list = document.getElementById('bezerrosList');
    if (!list) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/bezerros`);
        if (!response.ok) {
            throw new Error('Erro ao carregar bezerros');
        }

        bezerrosCache = await response.json();
        renderBezerros(bezerrosCache);
    } catch (error) {
        console.error(error);
        list.innerHTML = '<div class="card"><p>Não foi possível carregar os bezerros.</p></div>';
    }
}

function renderBezerros(bezerros) {
    const list = document.getElementById('bezerrosList');
    if (!list) {
        return;
    }

    if (!bezerros.length) {
        list.innerHTML = '<div class="card"><p>Nenhum bezerro cadastrado ainda.</p></div>';
        return;
    }

    list.innerHTML = bezerros.map(bezerro => {
        const sold = Number(bezerro.vendido) === 1;
        const sick = Number(bezerro.doente) === 1;
        const cardClass = ['bezerro-card'];
        if (sold && sick) {
            cardClass.push('bezerro-card--both');
        } else if (sold) {
            cardClass.push('bezerro-card--sold');
        } else if (sick) {
            cardClass.push('bezerro-card--sick');
        }

        const imageMarkup = bezerro.imagem_base64
            ? `<img class="bezerro-card__photo" src="${bezerro.imagem_base64}" alt="Foto de ${escapeHtml(bezerro.nome || 'bezerro')}">`
            : '<div class="card" style="padding: 12px; align-items: flex-start; width: 100%;">Sem foto cadastrada.</div>';

        return `
            <article class="${cardClass.join(' ')}">
                <div class="bezerro-card__header">
                    <div>
                        <h3>${escapeHtml(bezerro.nome || 'Sem nome')}</h3>
                        <p>${escapeHtml(bezerro.raca || 'Raça não informada')}</p>
                    </div>
                    <div class="bezerro-card__actions">
                        <button type="button" class="bezerro-action-btn bezerro-action-btn--edit" onclick="openBezerroFormById(${bezerro.id})">Editar</button>
                        <button type="button" class="bezerro-action-btn bezerro-action-btn--delete" onclick="deleteBezerro(${bezerro.id})">Excluir</button>
                    </div>
                </div>
                <div class="bezerro-card__meta">
                    <span class="bezerro-pill">Peso: ${escapeHtml(bezerro.peso || 'N/D')} kg</span>
                    <span class="bezerro-pill">Idade: ${escapeHtml(bezerro.idade || 'N/D')}</span>
                </div>
                ${imageMarkup}
                <div class="bezerro-card__footer">
                    <button type="button" class="bezerro-status-btn bezerro-status-btn--sale ${sold ? 'active' : ''}" onclick="toggleBezerroStatus(${bezerro.id}, 'vendido')" title="Marcar como vendido">
                        <span class="material-symbols-outlined">attach_money</span>
                    </button>
                    <button type="button" class="bezerro-status-btn bezerro-status-btn--health ${sick ? 'active' : ''}" onclick="toggleBezerroStatus(${bezerro.id}, 'doente')" title="Marcar como doente">
                        <span class="material-symbols-outlined">bug_report</span>
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

function openBezerroFormById(id) {
    const bezerro = bezerrosCache.find(item => Number(item.id) === Number(id));
    if (bezerro) {
        openBezerroForm(bezerro);
    }
}

async function submitBezerroForm(event) {
    event.preventDefault();

    const nomeBezerro = document.getElementById('nomeBezerro')?.value.trim();
    const raca = document.getElementById('racaBezerro')?.value;
    const peso = document.getElementById('pesoBezerro')?.value.trim();
    const idade = document.getElementById('idadeBezerro')?.value.trim();

    if (!nomeBezerro || !raca || !peso || !idade) {
        alert('Por favor, preencha todos os campos antes de enviar.');
        return;
    }

    try {
        const payload = {
            nome: nomeBezerro,
            raca,
            peso: Number(peso),
            idade,
            imagem_base64: bezerroPhotoBase64 || currentEditingBezerroPhoto || null
        };

        const response = await fetch(`${API_BASE_URL}${currentEditingBezerroId ? `/api/bezerros/${currentEditingBezerroId}` : '/api/bezerros'}`, {
            method: currentEditingBezerroId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || 'Erro ao salvar bezerro.');
        }

        await loadBezerros();
        closeBezerroForm();
        alert(currentEditingBezerroId ? 'Bezerro atualizado com sucesso!' : 'Bezerro cadastrado com sucesso!');
    } catch (err) {
        console.error(err);
        alert('Não foi possível salvar o bezerro. Tente novamente.');
    }
}

async function deleteBezerro(id) {
    if (!confirm('Deseja excluir este bezerro?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/bezerros/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || 'Erro ao excluir bezerro.');
        }

        await loadBezerros();
    } catch (err) {
        console.error(err);
        alert('Não foi possível excluir o bezerro.');
    }
}

async function toggleBezerroStatus(id, field) {
    const bezerro = bezerrosCache.find(item => Number(item.id) === Number(id));
    if (!bezerro) {
        return;
    }

    const nextValue = Number(bezerro[field]) === 1 ? 0 : 1;

    try {
        const response = await fetch(`${API_BASE_URL}/api/bezerros/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: nextValue })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || 'Erro ao atualizar status.');
        }

        bezerro[field] = nextValue;
        renderBezerros(bezerrosCache);
    } catch (err) {
        console.error(err);
        alert('Não foi possível atualizar o status do bezerro.');
    }
}

function initRebanhoPage() {
    const addButton = document.getElementById('addBezerroBtn');
    if (!addButton) {
        return;
    }

    addButton.addEventListener('click', () => openBezerroForm());
    document.getElementById('closeBezerroModal')?.addEventListener('click', closeBezerroForm);
    document.getElementById('fotoBezerro')?.addEventListener('change', handleBezerroPhotoUpload);
    document.getElementById('bezerroForm')?.addEventListener('submit', submitBezerroForm);
    loadBezerros();
}

window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    if (loginModal && event.target === loginModal) {
        loginModal.style.display = 'none';
    }

    const bezerroModal = document.getElementById('bezerroModal');
    if (bezerroModal && event.target === bezerroModal) {
        closeBezerroForm();
    }
};

window.onload = () => {
    carregarMercado();
    initRebanhoPage();
};

const LOCATIONIQ_TOKEN = 'pk.181b861bd05fe927689d4c53e4e07155';
