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

// Função para renderizar a lista
function carregarMercado() {
    const listaContainer = document.getElementById('lista-mercado');
    listaContainer.innerHTML = ""; // Limpa antes de carregar

    dadosMercado.forEach(item => {
        // Criando o elemento HTML via template string
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
    
    // Liga/Desliga a classe active
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Inicia a função ao carregar a página
window.onload = carregarMercado;

const LOCATIONIQ_TOKEN = "pk.181b861bd05fe927689d4c53e4e07155";
