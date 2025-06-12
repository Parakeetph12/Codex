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
function login() {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const loginError = document.getElementById('login-error');
    loginError.style.display = 'none';
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        document.querySelector('.main-sections').style.display = 'flex';
        document.querySelector('.drawer-container').style.display = 'block';
        document.getElementById('login-container').style.display = 'none';
        localStorage.setItem('currentUser', username);
        loadAll();
    } else {
        loginError.style.display = 'block';
    }
}
function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('login-container').style.display = 'block';
    document.querySelector('.main-sections').style.display = 'none';
    document.querySelector('.drawer-container').style.display = 'none';
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
            alert(`Dia selecionado: ${day}/${currentMonth + 1}/${currentYear}`);
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

// Novas funções para pagina2.html (Quadro Branco)
let isDrawing = false;
let currentColor = 'red';
function initWhiteboard() {
    const canvas = document.getElementById('whiteboard');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
}
function setColor(color) {
    currentColor = color;
    const canvas = document.getElementById('whiteboard');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.globalCompositeOperation = 'source-over';
    }
}
function setEraser() {
    const canvas = document.getElementById('whiteboard');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    }
}
function clearCanvas() {
    const canvas = document.getElementById('whiteboard');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Novas funções para pagina3.html (Diário)
function carregarAnotacoes() {
    const lista = document.getElementById('lista-anotacoes');
    if (!lista) return;
    lista.innerHTML = '';
    const anotacoes = JSON.parse(localStorage.getItem(getUserKey('anotacoes')) || '[]');
    anotacoes.forEach((anotacao, index) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = anotacao;
        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.onclick = () => excluirAnotacao(index);
        li.appendChild(span);
        li.appendChild(botaoExcluir);
        lista.appendChild(li);
    });
}
function salvarAnotacao() {
    const texto = document.getElementById('diario-texto')?.value.trim();
    if (texto) {
        const anotacoes = JSON.parse(localStorage.getItem(getUserKey('anotacoes')) || '[]');
        anotacoes.push(texto);
        localStorage.setItem(getUserKey('anotacoes'), JSON.stringify(anotacoes));
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

// Novas funções para pagina4.html (Contato)
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
    if (document.getElementById('login-container')) {
        document.getElementById('login-container').style.display = 'block';
        document.querySelector('.main-sections').style.display = 'none';
        document.querySelector('.drawer-container').style.display = 'none';
    }
    initWhiteboard();
    carregarAnotacoes();
    loadAll();
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