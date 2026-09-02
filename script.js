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
let bezerroPhotoRemoved = false;


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

let feedbackDismissTimer = null;
let feedbackClickCleanup = null;

const notificacoes = [
    {
        id: 1,
        tipo: 'desconto',
        titulo: 'Desconto',
        mensagem: 'Bezerros com 15% de desconto!',
        tempo: 'Há 10 minutos',
        actionLabel: 'Ver oferta',
        lida: false
    },
    {
        id: 2,
        tipo: 'aceita',
        titulo: 'Oferta aceita',
        mensagem: 'Sua oferta de compra foi aceita!',
        tempo: 'Há 1 hora',
        actionLabel: 'Detalhes',
        lida: true
    },
    {
        id: 3,
        tipo: 'negociacao',
        titulo: 'Interesse de negociação',
        mensagem: 'Um usuário deseja negociar a compra do seu bezerro.',
        tempo: 'Hoje',
        actionLabel: 'Responder',
        lida: false
    }
];

const alertas = [
    {
        id: 1,
        tipo: 'area',
        titulo: 'Bezerro fora da área',
        mensagem: 'Um bezerro saiu da área!',
        tempo: 'Há 5 minutos',
        actionLabel: 'Ver mapa',
        lida: false
    },
    {
        id: 2,
        tipo: 'saude',
        titulo: 'Bezerro doente',
        mensagem: 'Um dos seus bezerros está marcado como doente!',
        tempo: 'Há 25 minutos',
        actionLabel: 'Ver detalhes',
        lida: true
    },
    {
        id: 3,
        tipo: 'bateria',
        titulo: 'Bateria fraca',
        mensagem: 'A bateria de um dos seus bezerros está acabando!',
        tempo: 'Há 1 hora',
        actionLabel: 'Ver status',
        lida: false
    },
    {
        id: 4,
        tipo: 'morte',
        titulo: 'Possível morte',
        mensagem: 'Um dos seus bezerros não se movimentou por mais de 15 horas!',
        tempo: 'Há 2 horas',
        actionLabel: 'Ver histórico',
        lida: false
    }
];

function renderNotificacoes(filter = 'all') {
    const list = document.getElementById('notificacoesList');
    if (!list) {
        return;
    }

    const itensFiltrados = notificacoes.filter(item => filter === 'all' || item.tipo === filter);

    if (!itensFiltrados.length) {
        list.innerHTML = '<div class="card"><p>Nenhuma notificação para este filtro.</p></div>';
        return;
    }

    list.innerHTML = itensFiltrados.map(item => {
        const iconMap = {
            desconto: 'sell',
            aceita: 'check_circle',
            negociacao: 'handshake'
        };

        return `
            <article class="notificacao-item notificacao-item--${item.tipo} ${item.lida ? 'is-read' : ''}" data-id="${item.id}">
                <div class="notification-icon">
                    <span class="material-symbols-outlined">${iconMap[item.tipo]}</span>
                </div>
                <div class="notification-content">
                    <h3>${escapeHtml(item.titulo)}</h3>
                    <p>${escapeHtml(item.mensagem)}</p>
                    <span class="notification-time">${escapeHtml(item.tempo)}</span>
                </div>
                <button type="button" class="notification-action" data-id="${item.id}">${escapeHtml(item.actionLabel)}</button>
            </article>
        `;
    }).join('');
}

function handleNotificationFilterClick(event) {
    const filterButton = event.target.closest('.notification-filter');
    if (!filterButton) {
        return;
    }

    const filter = filterButton.dataset.filter;
    document.querySelectorAll('.notification-filter').forEach(button => {
        button.classList.toggle('is-active', button === filterButton);
    });

    renderNotificacoes(filter);
}

function handleNotificationActionClick(event) {
    const actionButton = event.target.closest('.notification-action');
    if (!actionButton) {
        return;
    }

    const notificationId = Number(actionButton.dataset.id);
    const notification = notificacoes.find(item => item.id === notificationId);
    if (!notification) {
        return;
    }

    notification.lida = true;
    const activeFilter = document.querySelector('.notification-filter.is-active')?.dataset.filter || 'all';
    renderNotificacoes(activeFilter);
    showStatusNotification('success', `${notification.titulo}: ação realizada.`);
}

function renderAlertas(filter = 'all') {
    const list = document.getElementById('alertasList');
    if (!list) {
        return;
    }

    const itensFiltrados = alertas.filter(item => filter === 'all' || item.tipo === filter);

    if (!itensFiltrados.length) {
        list.innerHTML = '<div class="card"><p>Nenhum alerta para este filtro.</p></div>';
        return;
    }

    list.innerHTML = itensFiltrados.map(item => {
        const iconMap = {
            area: 'location_searching',
            saude: 'medical_services',
            bateria: 'battery_alert',
            morte: 'warning'
        };

        return `
            <article class="notificacao-item notificacao-item--${item.tipo} ${item.lida ? 'is-read' : ''}" data-id="${item.id}">
                <div class="notification-icon">
                    <span class="material-symbols-outlined">${iconMap[item.tipo]}</span>
                </div>
                <div class="notification-content">
                    <h3>${escapeHtml(item.titulo)}</h3>
                    <p>${escapeHtml(item.mensagem)}</p>
                    <span class="notification-time">${escapeHtml(item.tempo)}</span>
                </div>
                <button type="button" class="notification-action" data-id="${item.id}">${escapeHtml(item.actionLabel)}</button>
            </article>
        `;
    }).join('');
}

function handleAlertaFilterClick(event) {
    const filterButton = event.target.closest('.notification-filter');
    if (!filterButton) {
        return;
    }

    const filter = filterButton.dataset.filter;
    document.querySelectorAll('.notification-filter').forEach(button => {
        button.classList.toggle('is-active', button === filterButton);
    });

    renderAlertas(filter);
}

function handleAlertaActionClick(event) {
    const actionButton = event.target.closest('.notification-action');
    if (!actionButton) {
        return;
    }

    const alertaId = Number(actionButton.dataset.id);
    const alerta = alertas.find(item => item.id === alertaId);
    if (!alerta) {
        return;
    }

    alerta.lida = true;
    const activeFilter = document.querySelector('.notification-filter.is-active')?.dataset.filter || 'all';
    renderAlertas(activeFilter);
    showStatusNotification('success', `${alerta.titulo}: ação registrada.`);
}

function initNotificacoesPage() {
    const list = document.getElementById('notificacoesList');
    if (!list) {
        return;
    }

    renderNotificacoes();
    document.querySelectorAll('.notification-filter').forEach(button => {
        button.addEventListener('click', handleNotificationFilterClick);
    });
    list.addEventListener('click', handleNotificationActionClick);
}

function initAlertasPage() {
    const list = document.getElementById('alertasList');
    if (!list) {
        return;
    }

    renderAlertas();
    document.querySelectorAll('.notification-filter').forEach(button => {
        button.addEventListener('click', handleAlertaFilterClick);
    });
    list.addEventListener('click', handleAlertaActionClick);
}

function dismissStatusNotification() {
    const notification = document.getElementById('statusNotification');
    if (feedbackDismissTimer) {
        clearTimeout(feedbackDismissTimer);
        feedbackDismissTimer = null;
    }
    if (feedbackClickCleanup) {
        feedbackClickCleanup();
        feedbackClickCleanup = null;
    }
    notification?.classList.remove('active');
}

function showStatusNotification(type, message) {
    let notification = document.getElementById('statusNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'statusNotification';
        notification.className = 'status-notification';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <div class="status-notification__card">
                <div class="status-notification__icon" aria-hidden="true"></div>
                <p class="status-notification__message"></p>
            </div>
        `;
        document.body.appendChild(notification);
    }

    dismissStatusNotification();
    notification.className = `status-notification status-notification--${type} active`;
    notification.querySelector('.status-notification__icon').textContent = type === 'success' ? '✓' : '✕';
    notification.querySelector('.status-notification__message').textContent = message;

    feedbackDismissTimer = setTimeout(dismissStatusNotification, 5000);
    setTimeout(() => {
        if (!notification.classList.contains('active')) {
            return;
        }
        const handleDocumentClick = () => dismissStatusNotification();
        document.addEventListener('click', handleDocumentClick, { once: true });
        feedbackClickCleanup = () => document.removeEventListener('click', handleDocumentClick);
    }, 0);
}

async function login(event, formElement) {
    event.preventDefault(); 
    const formData = new FormData(formElement);
    const formObject = Object.fromEntries(formData);
    

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formObject)
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar bezerros');
        }

        user = await response.json();
        console.log("Meu usuário: ", user);
        localStorage.setItem('user_id', (user.id).toString());
        window.location.href = "index.html";
    } catch (error) {
        showStatusNotification('error', 'Não foi possível realizar o login.');
        console.error(error);
    }

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
    bezerroPhotoRemoved = false;

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
    }

    updatePhotoPreviewControls(false);
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
        bezerroPhotoRemoved = false;

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
        }

        updatePhotoPreviewControls(Boolean(bezerro.imagem_base64));
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
        bezerroPhotoBase64 = bezerroPhotoRemoved ? '' : currentEditingBezerroPhoto || '';
        if (preview) {
            if (bezerroPhotoBase64) {
                preview.style.backgroundImage = `url(${bezerroPhotoBase64})`;
            } else {
                preview.style.backgroundImage = '';
            }
        }
        updatePhotoPreviewControls(Boolean(bezerroPhotoBase64));
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        bezerroPhotoBase64 = reader.result;
        bezerroPhotoRemoved = false;
        if (preview) {
            preview.style.backgroundImage = `url(${bezerroPhotoBase64})`;
        }
        updatePhotoPreviewControls(true);
    };

    reader.readAsDataURL(file);
}

function updatePhotoPreviewControls(hasImage) {
    const previewText = document.getElementById('photoPreviewText');
    const removePhotoButton = document.getElementById('removePhotoBtn');

    if (previewText) {
        previewText.textContent = hasImage ? '' : 'Clique para selecionar uma imagem';
    }

    if (removePhotoButton) {
        removePhotoButton.hidden = !hasImage;
    }
}

function removeBezerroPhoto(event) {
    event.stopPropagation();
    bezerroPhotoBase64 = '';
    currentEditingBezerroPhoto = '';
    bezerroPhotoRemoved = true;

    const fileInput = document.getElementById('fotoBezerro');
    if (fileInput) {
        fileInput.value = '';
    }

    const preview = document.getElementById('photoPreview');
    if (preview) {
        preview.style.backgroundImage = '';
    }

    updatePhotoPreviewControls(false);
}

async function loadBezerros() {
    const list = document.getElementById('bezerrosList');
    if (!list) {
        return;
    }

    try {
        const userId = localStorage.getItem('user_id');

        console.log('USER ID: ', userId);
        if(userId == null){
            showStatusNotification('error', 'Faça o login para visualizar seu rebanho.');
        }

        const response = await fetch(`${API_BASE_URL}/api/bezerros_by_user/${userId}`);
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
            <article class="${cardClass.join(' ')}" data-id="${bezerro.id}" tabindex="0" role="button" aria-label="Abrir detalhes do bezerro ${escapeHtml(bezerro.nome || 'Sem nome')}">
                <div class="bezerro-card__header">
                    <div>
                        <h3>${escapeHtml(bezerro.nome || 'Sem nome')}</h3>
                        <p>${escapeHtml(bezerro.raca || 'Raça não informada')}</p>
                    </div>
                    <div class="bezerro-card__actions">
                        <button type="button" class="bezerro-action-btn bezerro-action-btn--edit" onclick="event.stopPropagation(); openBezerroFormById(${bezerro.id})">Editar</button>
                        <button type="button" class="bezerro-action-btn bezerro-action-btn--delete" onclick="event.stopPropagation(); deleteBezerro(${bezerro.id})">Excluir</button>
                    </div>
                </div>
                <div class="bezerro-card__meta">
                    <span class="bezerro-pill">Peso: ${escapeHtml(bezerro.peso || 'N/D')} kg</span>
                    <span class="bezerro-pill">Idade: ${escapeHtml(bezerro.idade || 'N/D')}</span>
                </div>
                ${imageMarkup}
                <div class="bezerro-card__footer">
                    <button type="button" class="bezerro-status-btn bezerro-status-btn--sale ${sold ? 'active' : ''}" onclick="event.stopPropagation(); toggleBezerroStatus(${bezerro.id}, 'vendido')" title="Marcar como vendido">
                        <span class="material-symbols-outlined">attach_money</span>
                    </button>
                    <button type="button" class="bezerro-status-btn bezerro-status-btn--health ${sick ? 'active' : ''}" onclick="event.stopPropagation(); toggleBezerroStatus(${bezerro.id}, 'doente')" title="Marcar como doente">
                        <span class="material-symbols-outlined">bug_report</span>
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

function openBezerroDetail(bezerro) {
    const modal = document.getElementById('bezerroDetailModal');
    const image = document.getElementById('bezerroDetailImage');
    const name = document.getElementById('bezerroDetailName');
    const meta = document.getElementById('bezerroDetailMeta');

    if (!modal || !image || !name || !meta) {
        return;
    }

    const sold = Number(bezerro.vendido) === 1;
    const sick = Number(bezerro.doente) === 1;
    image.src = bezerro.imagem_base64 || '';
    image.alt = `Foto de ${bezerro.nome || 'bezerro'}`;
    image.hidden = !bezerro.imagem_base64;
    name.textContent = bezerro.nome || 'Bezerro sem nome';
    meta.innerHTML = `
        <span class="detail-tag">${escapeHtml(bezerro.raca || 'Raça não informada')}</span>
        <span class="detail-tag">Peso: ${escapeHtml(bezerro.peso || 'N/D')} kg</span>
        <span class="detail-tag">Idade: ${escapeHtml(bezerro.idade || 'N/D')}</span>
        <span class="detail-tag">${sold ? 'Vendido' : 'Disponível'}</span>
        <span class="detail-tag">${sick ? 'Doente' : 'Saudável'}</span>
    `;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeBezerroDetail() {
    const modal = document.getElementById('bezerroDetailModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function handleBezerroCardClick(event) {
    const clickedControl = event.target.closest('button, a, input, select, textarea');
    if (clickedControl) {
        return;
    }

    const card = event.target.closest('.bezerro-card');
    if (!card) {
        return;
    }

    const bezerro = bezerrosCache.find(item => Number(item.id) === Number(card.dataset.id));
    if (bezerro) {
        openBezerroDetail(bezerro);
    }
}

function handleBezerroCardKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
        return;
    }

    event.preventDefault();
    handleBezerroCardClick(event);
}

function openBezerroFormById(id) {
    const bezerro = bezerrosCache.find(item => Number(item.id) === Number(id));
    if (bezerro) {
        openBezerroForm(bezerro);
    }
}

async function submitBezerroForm(event) {
    event.preventDefault();
    const isEditing = Boolean(currentEditingBezerroId);

    const nomeBezerro = document.getElementById('nomeBezerro')?.value.trim();
    const raca = document.getElementById('racaBezerro')?.value;
    const peso = document.getElementById('pesoBezerro')?.value.trim();
    const idade = document.getElementById('idadeBezerro')?.value.trim();

    if (!nomeBezerro || !raca || !peso || !idade) {
        showStatusNotification('error', 'Por favor, preencha todos os campos antes de enviar.');
        return;
    }

    try {
        const payload = {
            nome: nomeBezerro,
            raca,
            peso: Number(peso),
            idade,
            imagem_base64: bezerroPhotoRemoved ? null : (bezerroPhotoBase64 || currentEditingBezerroPhoto || null)
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
        showStatusNotification('success', isEditing ? 'Bezerro atualizado com sucesso!' : 'Bezerro cadastrado com sucesso!');
    } catch (err) {
        console.error(err);
        showStatusNotification('error', 'Não foi possível salvar o bezerro. Tente novamente.');
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
        showStatusNotification('error', 'Não foi possível excluir o bezerro.');
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
        showStatusNotification('error', 'Não foi possível atualizar o status do bezerro.');
    }
}

function initRebanhoPage() {
    const addButton = document.getElementById('addBezerroBtn');
    const list = document.getElementById('bezerrosList');
    if (!addButton) {
        return;
    }

    addButton.addEventListener('click', () => openBezerroForm());
    document.getElementById('closeBezerroModal')?.addEventListener('click', closeBezerroForm);
    document.getElementById('fotoBezerro')?.addEventListener('change', handleBezerroPhotoUpload);
    document.getElementById('removePhotoBtn')?.addEventListener('click', removeBezerroPhoto);
    document.getElementById('bezerroForm')?.addEventListener('submit', submitBezerroForm);
    document.getElementById('bezerroDetailModal')?.addEventListener('click', event => {
        if (event.target.closest('[data-close="true"]')) {
            closeBezerroDetail();
        }
    });
    list?.addEventListener('click', handleBezerroCardClick);
    list?.addEventListener('keydown', handleBezerroCardKeydown);
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

    const bezerroDetailModal = document.getElementById('bezerroDetailModal');
    if (bezerroDetailModal && event.target === bezerroDetailModal) {
        closeBezerroDetail();
    }
};

window.onload = () => {
    carregarMercado();
    initRebanhoPage();
    initNotificacoesPage();
    initAlertasPage();
};

const LOCATIONIQ_TOKEN = 'pk.181b861bd05fe927689d4c53e4e07155';
