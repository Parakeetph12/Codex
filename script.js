// Sistema de usuários
function getUsers() {
    return JSON.parse(localStorage.getItem('codexUsers')) || [];
}
function saveUsers(users) {
    localStorage.setItem('codexUsers', JSON.stringify(users));
}
function getCurrentUser() {
    return localStorage.getItem('currentUser');
}
function getUserKey(key) {
    const user = getCurrentUser();
    return user ? `${key}_${user}` : key;
}
function loadUserList() {
    const userList = document.getElementById('user-list');
    if (!userList) return;
    userList.innerHTML = '';
    const users = getUsers();
    if (users.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum usuário cadastrado';
        li.style.color = '#888';
        li.style.cursor = 'default';
        userList.appendChild(li);
        return;
    }
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.username;
        li.onclick = () => {
            document.getElementById('username').value = user.username;
            document.getElementById('password').focus();
        };
        userList.appendChild(li);
    });
}
function registerUser() {
    const username = document.getElementById('new-username')?.value.trim();
    const password = document.getElementById('new-password')?.value.trim();
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');
    if (!username || !password) {
        registerError.textContent = 'Usuário e senha são obrigatórios';
        registerError.style.display = 'block';
        return;
    }
    if (password.length < 4) {
        registerError.textContent = 'A senha deve ter pelo menos 4 caracteres';
        registerError.style.display = 'block';
        return;
    }
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        registerError.textContent = 'Usuário já existe';
        registerError.style.display = 'block';
        return;
    }
    users.push({ username, password });
    saveUsers(users);
    localStorage.setItem(`tarefasPermanentes_${username}`, JSON.stringify([]));
    localStorage.setItem(`tarefasDiarias_${username}`, JSON.stringify([]));
    localStorage.setItem(`notas_${username}`, JSON.stringify([]));
    localStorage.setItem(`tarefasAdicionais_${username}`, JSON.stringify([]));
    localStorage.setItem(`links_${username}`, JSON.stringify([]));
    localStorage.setItem(`anotacoes_${username}`, JSON.stringify([])); // Para o diário
    localStorage.setItem(`pontos_${username}`, '0');
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    registerSuccess.style.display = 'block';
    setTimeout(() => registerSuccess.style.display = 'none', 2000);
    loadUserList();
}

// Funções de autenticação

// Função para verificar estado de autenticação
function checkAuthState() {
    const currentUser = getCurrentUser();
    const loginContainer = document.getElementById('login-container');
    const mainSections = document.querySelector('.main-sections');
    const drawerContainer = document.querySelector('.drawer-container');
    const nav = document.querySelector('nav');
    
    if (currentUser) {
        // Usuário está logado - mostrar conteúdo
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainSections) mainSections.style.display = 'flex';
        if (drawerContainer) drawerContainer.style.display = 'block';
        if (nav) nav.style.display = 'flex';
        loadAll(); // Carregar dados do usuário
    } else {
        // Usuário não está logado - mostrar login
        if (loginContainer) loginContainer.style.display = 'block';
        if (mainSections) mainSections.style.display = 'none';
        if (drawerContainer) drawerContainer.style.display = 'none';
        if (nav) nav.style.display = 'none';
    }
}

// Verificação de autenticação para páginas sem login
function checkPageAuth() {
    const currentUser = getCurrentUser();
    const hasLoginContainer = document.getElementById('login-container');
    
    // Se é uma página sem login container mas usuário não está logado
    if (!hasLoginContainer && !currentUser) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Se é a página inicial com login container
    if (hasLoginContainer && currentUser) {
        checkAuthState();
    }
    
    return true;
}

function login() {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const loginError = document.getElementById('login-error');
    loginError.style.display = 'none';
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', username);
        checkAuthState(); 
    } else {
        loginError.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    checkAuthState(); // Usar a nova função
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('gerenciar-tarefas').style.display = 'none';
}

// Funções de tarefas diárias
function carregarTarefasDiarias() {
    const hoje = new Date().toLocaleDateString();
    const user = getCurrentUser();
    const ultimaAtualizacao = localStorage.getItem(getUserKey('ultimaAtualizacao'));
    const tarefasPermanentes = JSON.parse(localStorage.getItem(getUserKey('tarefasPermanentes'))) || [];
    if (ultimaAtualizacao !== hoje) {
        const tarefas = tarefasPermanentes.map(tarefa => ({
            tarefa,
            concluida: false
        }));
        localStorage.setItem(getUserKey('tarefasDiarias'), JSON.stringify(tarefas));
        localStorage.setItem(getUserKey('ultimaAtualizacao'), hoje);
    }
    const tarefas = JSON.parse(localStorage.getItem(getUserKey('tarefasDiarias'))) || [];
    const lista = document.getElementById('tarefas-diarias');
    lista.innerHTML = '';
    tarefas.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.concluida;
        checkbox.style.marginRight = '10px';
        checkbox.addEventListener('change', () => marcarTarefa(index));
        const texto = document.createElement('span');
        texto.textContent = item.tarefa;
        texto.style.textDecoration = item.concluida ? 'line-through' : 'none';
        li.appendChild(checkbox);
        li.appendChild(texto);
        lista.appendChild(li);
    });
}
function marcarTarefa(index) {
    const tarefas = JSON.parse(localStorage.getItem(getUserKey('tarefasDiarias'))) || [];
    if (!tarefas[index].concluida) {
        tarefas[index].concluida = true;
        const pontosAtuais = parseInt(localStorage.getItem(getUserKey('pontos')) || '0');
        localStorage.setItem(getUserKey('pontos'), pontosAtuais + 10);
    }
    localStorage.setItem(getUserKey('tarefasDiarias'), JSON.stringify(tarefas));
    carregarTarefasDiarias();
    atualizarPontos();
}
function adicionarTarefaDiaria() {
    const novaTarefa = document.getElementById('nova-tarefa-diaria')?.value.trim();
    if (novaTarefa !== '') {
        const tarefasPermanentes = JSON.parse(localStorage.getItem(getUserKey('tarefasPermanentes'))) || [];
        if (!tarefasPermanentes.includes(novaTarefa)) {
            tarefasPermanentes.push(novaTarefa);
            localStorage.setItem(getUserKey('tarefasPermanentes'), JSON.stringify(tarefasPermanentes));
        }
        const tarefas = JSON.parse(localStorage.getItem(getUserKey('tarefasDiarias'))) || [];
        if (!tarefas.some(t => t.tarefa === novaTarefa)) {
            tarefas.push({
                tarefa: novaTarefa,
                concluida: false
            });
            localStorage.setItem(getUserKey('tarefasDiarias'), JSON.stringify(tarefas));
        }
        carregarTarefasDiarias();
        document.getElementById('nova-tarefa-diaria').value = '';
        mostrarGerenciarTarefas();
    }
}
function mostrarGerenciarTarefas() {
    const gerenciarSection = document.getElementById('gerenciar-tarefas');
    const listaGerenciar = document.getElementById('lista-tarefas-gerenciar');
    listaGerenciar.innerHTML = '';
    const tarefasPermanentes = JSON.parse(localStorage.getItem(getUserKey('tarefasPermanentes'))) || [];
    if (tarefasPermanentes.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhuma tarefa permanente cadastrada';
        li.style.color = '#888';
        listaGerenciar.appendChild(li);
    } else {
        tarefasPermanentes.forEach((tarefa, index) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = tarefa;
            const botaoExcluir = document.createElement('button');
            botaoExcluir.textContent = 'Remover';
            botaoExcluir.onclick = () => removerTarefaPermanente(index);
            li.appendChild(span);
            li.appendChild(botaoExcluir);
            listaGerenciar.appendChild(li);
        });
    }
    gerenciarSection.style.display = gerenciarSection.style.display === 'none' ? 'block' : 'none';
}
function removerTarefaPermanente(index) {
    const tarefasPermanentes = JSON.parse(localStorage.getItem(getUserKey('tarefasPermanentes'))) || [];
    const tarefaRemovida = tarefasPermanentes.splice(index, 1)[0];
    localStorage.setItem(getUserKey('tarefasPermanentes'), JSON.stringify(tarefasPermanentes));
    const tarefasDiarias = JSON.parse(localStorage.getItem(getUserKey('tarefasDiarias'))) || [];
    const indexDiaria = tarefasDiarias.findIndex(t => t.tarefa === tarefaRemovida);
    if (indexDiaria !== -1) {
        tarefasDiarias.splice(indexDiaria, 1);
        localStorage.setItem(getUserKey('tarefasDiarias'), JSON.stringify(tarefasDiarias));
    }
    mostrarGerenciarTarefas();
    carregarTarefasDiarias();
}

// Funções de notas, tarefas adicionais e links
function carregarDados() {
    const notas = JSON.parse(localStorage.getItem(getUserKey('notas')) || '[]');
    const tarefasAdicionais = JSON.parse(localStorage.getItem(getUserKey('tarefasAdicionais')) || '[]');
    const links = JSON.parse(localStorage.getItem(getUserKey('links')) || '[]');
    const listaNotas = document.getElementById('lista-notas');
    const listaTarefasAdicionais = document.getElementById('lista-tarefas-adicionais');
    const listaLinks = document.getElementById('lista-links');
    listaNotas.innerHTML = '';
    listaTarefasAdicionais.innerHTML = '';
    listaLinks.innerHTML = '';
    notas.forEach((nota, index) => {
        const item = criarItemComBotao(nota, index, 'notas');
        listaNotas.appendChild(item);
    });
    tarefasAdicionais.forEach((tarefa, index) => {
        const item = criarItemComBotao(tarefa, index, 'tarefasAdicionais');
        listaTarefasAdicionais.appendChild(item);
    });
    links.forEach((link, index) => {
        const item = criarItemComBotao(link, index, 'links', true);
        listaLinks.appendChild(item);
    });
}
function criarItemComBotao(conteudo, index, tipo, isLink = false) {
    const item = document.createElement('li');
    if (isLink) {
        const anchor = document.createElement('a');
        anchor.href = conteudo;
        anchor.textContent = conteudo;
        anchor.target = '_blank';
        item.appendChild(anchor);
    } else {
        item.textContent = conteudo;
    }
    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.style.marginLeft = '10px';
    botaoExcluir.onclick = () => excluirItem(index, tipo);
    item.appendChild(botaoExcluir);
    return item;
}
function excluirItem(index, tipo) {
    const dados = JSON.parse(localStorage.getItem(getUserKey(tipo)) || '[]');
    dados.splice(index, 1);
    localStorage.setItem(getUserKey(tipo), JSON.stringify(dados));
    if (tipo === 'tarefasAdicionais') {
        const pontosAtuais = parseInt(localStorage.getItem(getUserKey('pontos')));
        localStorage.setItem(getUserKey('pontos'), pontosAtuais + 5);
        atualizarPontos();
    }
    atualizarLista(tipo);
}
function atualizarLista(tipo) {
    let lista;
    if (tipo === 'notas') {
        lista = document.getElementById('lista-notas');
    } else if (tipo === 'tarefasAdicionais') {
        lista = document.getElementById('lista-tarefas-adicionais');
    } else if (tipo === 'links') {
        lista = document.getElementById('lista-links');
    } else {
        return;
    }
    lista.innerHTML = '';
    const dados = JSON.parse(localStorage.getItem(getUserKey(tipo)) || '[]');
    dados.forEach((conteudo, index) => {
        const item = criarItemComBotao(conteudo, index, tipo, tipo === 'links');
        lista.appendChild(item);
    });
}
function adicionarNota() {
    const nota = document.getElementById('nova-nota')?.value.trim();
    if (nota !== '') {
        const notas = JSON.parse(localStorage.getItem(getUserKey('notas')) || '[]');
        notas.push(nota);
        localStorage.setItem(getUserKey('notas'), JSON.stringify(notas));
        atualizarLista('notas');
        document.getElementById('nova-nota').value = '';
    }
}
function adicionarTarefaAdicional() {
    const tarefa = document.getElementById('nova-tarefa-adicional')?.value.trim();
    if (tarefa !== '') {
        const tarefasAdicionais = JSON.parse(localStorage.getItem(getUserKey('tarefasAdicionais')) || '[]');
        tarefasAdicionais.push(tarefa);
        localStorage.setItem(getUserKey('tarefasAdicionais'), JSON.stringify(tarefasAdicionais));
        atualizarLista('tarefasAdicionais');
        document.getElementById('nova-tarefa-adicional').value = '';
    }
}
function adicionarLink() {
    const link = document.getElementById('novo-link')?.value.trim();
    if (link !== '') {
        const links = JSON.parse(localStorage.getItem(getUserKey('links')) || '[]');
        links.push(link);
        localStorage.setItem(getUserKey('links'), JSON.stringify(links));
        atualizarLista('links');
        document.getElementById('novo-link').value = '';
    }
}

// Funções do calendário
function toggleDrawer() {
    const drawerContent = document.getElementById('drawer-content');
    const drawerArrow = document.getElementById('drawer-arrow');
    drawerContent.classList.toggle('active');
    drawerArrow.textContent = drawerContent.classList.contains('active') ? '▲' : '▼';
    if (drawerContent.classList.contains('active')) {
        ajustarTamanhoTela();
    }
}
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('calendar-month-year');
    if (!calendar || !monthYear) return;
    calendar.innerHTML = '';
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        const today = new Date();
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayElement.classList.add('current');
        }
        dayElement.onclick = () => {
            let notification = document.getElementById('calendar-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'calendar-notification';
                notification.style.position = 'fixed';
                notification.style.bottom = '20px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.background = '#333';
                notification.style.color = '#fff';
                notification.style.padding = '10px 20px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '1000';
                document.body.appendChild(notification);
            }
            notification.textContent = `Dia selecionado: ${day}/${currentMonth + 1}/${currentYear}`;
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 2000);
        };
        calendar.appendChild(dayElement);
    }
}
function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}
function ajustarTamanhoTela() {
    const largura = Math.min(parseInt(document.getElementById('largura-tela')?.value) || 800, 2000);
    const altura = Math.min(parseInt(document.getElementById('altura-tela')?.value) || 500, 1000);
    const calendar = document.getElementById('calendar');
    if (calendar) {
        calendar.style.width = largura + 'px';
        calendar.style.height = altura + 'px';
        generateCalendar();
    }
}
function atualizarPontos() {
    const pontos = localStorage.getItem(getUserKey('pontos')) || '0';
    const pontosElement = document.getElementById('pontos');
    if (pontosElement) {
        pontosElement.textContent = `Pontos: ${pontos}`;
    }
}

// Quadro Branco
const canvas = document.getElementById('whiteboard');
const ctx = canvas ? canvas.getContext('2d') : null;
let desenhando = false;
let tamanhoTraco = 2;
let corDesenho = '#000000';
let modoBorracha = false;

// Inicializa o canvas
function inicializarCanvas() {
    if (!canvas || !ctx) {
        console.error('Canvas ou contexto não encontrado');
        return;
    }
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Funções de controle
function setColor(cor) {
    corDesenho = cor;
    modoBorracha = false;
    if (ctx) {
        ctx.strokeStyle = cor;
        ctx.globalCompositeOperation = 'source-over';
    }
}

function setEraser() {
    modoBorracha = true;
    if (ctx) {
        ctx.strokeStyle = '#ffffff';
        ctx.globalCompositeOperation = 'source-over';
    }
}

function clearCanvas() {
    if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function resizeCanvas() {
    if (!canvas || !ctx) return;
    const largura = Math.min(parseInt(document.getElementById('canvas-width')?.value) || 1200, 2000);
    const altura = Math.min(parseInt(document.getElementById('canvas-height')?.value) || 800, 1500);

    // Salva o conteúdo atual
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Aplica novo tamanho
    canvas.style.width = largura + 'px';
    canvas.style.height = altura + 'px';
    canvas.width = largura;
    canvas.height = altura;

    // Restaura o conteúdo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
}

// Eventos de desenho
if (canvas) {
    document.getElementById('tamanho-traco').addEventListener('input', (e) => {
        tamanhoTraco = parseInt(e.target.value);
    });

    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Apenas botão esquerdo
        desenhando = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (desenhando) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = modoBorracha ? '#ffffff' : corDesenho;
            ctx.lineWidth = tamanhoTraco;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', () => {
        desenhando = false;
    });

    canvas.addEventListener('mouseout', () => {
        desenhando = false;
    });

    // Inicializa o canvas
    inicializarCanvas();
}

// funções para pagina3.html (Diário)
function carregarAnotacoes() {
    const lista = document.getElementById('lista-anotacoes');
    if (!lista) return;
    lista.innerHTML = '';

    const anotacoes = JSON.parse(localStorage.getItem(getUserKey('anotacoes')) || '[]');

    anotacoes.forEach((anotacao, index) => {
        const li = document.createElement('li');

       const titulo = document.createElement('h4');
        titulo.textContent = anotacao.titulo || 'Sem título'; 

        const span = document.createElement('span');
        span.textContent = anotacao;

        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';

        botaoExcluir.onclick = () => excluirAnotacao(index);

        li.appendChild(titulo);
        li.appendChild(span);
        li.appendChild(botaoExcluir);
        lista.appendChild(li);
    });
}
function salvarAnotacao() {
    const titulo = document.getElementById('diario-titulo')?.value.trim();
    const texto = document.getElementById('diario-texto')?.value.trim();
    if (texto) {
        const anotacoes = JSON.parse(localStorage.getItem(getUserKey('anotacoes')) || '[]');
        anotacoes.push({
            titulo: titulo,
            texto: texto,
            data: new Date().toLocaleDateString()
        });
        localStorage.setItem(getUserKey('anotacoes'), JSON.stringify(anotacoes));

        document.getElementById('diario-titulo').value = '';
        document.getElementById('diario-texto').value = '';
        carregarAnotacoes();
    }
}
function excluirAnotacao(index) {
    const anotacoes = JSON.parse(localStorage.getItem(getUserKey('anotacoes')) || '[]');
    anotacoes.splice(index, 1);
    localStorage.setItem(getUserKey('anotacoes'), JSON.stringify(anotacoes));
    carregarAnotacoes();
}

// funções para pagina4.html (Contato)
function submitContactForm() {
    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();
    const error = document.getElementById('contact-error');
    const success = document.getElementById('contact-success');
    error.style.display = 'none';
    success.style.display = 'none';
    if (!name || !email || !message) {
        error.textContent = 'Preencha todos os campos.';
        error.style.display = 'block';
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error.textContent = 'E-mail inválido.';
        error.style.display = 'block';
        return;
    }
    success.style.display = 'block';
    setTimeout(() => success.style.display = 'none', 2000);
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-message').value = '';
}

// Inicializa o quadro branco se existir
function initWhiteboard() {
    if (canvas && ctx) {
        inicializarCanvas();
    }
}

// Inicialização
window.onload = () => {
    loadUserList();
    const users = getUsers();
    if (users.length === 0) {
        saveUsers([{ username: 'ParakeetPH12', password: '157751' }]);
        localStorage.setItem('tarefasPermanentes_ParakeetPH12', JSON.stringify([]));
        localStorage.setItem('tarefasDiarias_ParakeetPH12', JSON.stringify([]));
        localStorage.setItem('notas_ParakeetPH12', JSON.stringify([]));
        localStorage.setItem('tarefasAdicionais_ParakeetPH12', JSON.stringify([]));
        localStorage.setItem('links_ParakeetPH12', JSON.stringify([]));
        localStorage.setItem('anotacoes_ParakeetPH12', JSON.stringify([]));
        localStorage.setItem('pontos_ParakeetPH12', '0');
        loadUserList();
    }
    
    // VERIFICAÇÃO DE AUTENTICAÇÃO
    checkPageAuth();
    
    // Inicializações específicas de cada página
    initWhiteboard();
    carregarAnotacoes();
    
    if (document.getElementById('calendar')) {
        generateCalendar();
    }
    
    window.addEventListener('resize', () => {
        if (document.getElementById('drawer-content')?.classList.contains('active')) {
            const calendar = document.getElementById('calendar');
            const proporcao = parseInt(document.getElementById('largura-tela')?.value || 800) / parseInt(document.getElementById('altura-tela')?.value || 500);
            calendar.style.width = '100%';
            calendar.style.height = (calendar.offsetWidth / proporcao) + 'px';
            generateCalendar();
        }
    });
};
function loadAll() {
    carregarTarefasDiarias();
    carregarDados();
    atualizarPontos();
    if (document.getElementById('calendar')) {
        generateCalendar();
    }
}