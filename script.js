// Lista de tarefas diárias
const tarefasDiarias = [
    "Dar comida para os cachorros (dia)",
    "Dar comida para os cachorros (noite)",
    "Lavar a louça (dia)",
    "Lavar a louça (noite)",
    "Programar no Codex",
    "Estudar C",
    "Tomar Creatina",
    "Remedio tireoide",
    "Remedio cachorro",
];

// Sistema de usuários
function getUsers() {
    return JSON.parse(localStorage.getItem('codexUsers')) || [];
}

function saveUsers(users) {
    localStorage.setItem('codexUsers', JSON.stringify(users));
}

function loadUserList() {
    const userList = document.getElementById('user-list');
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
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value.trim();
    
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');
    
    registerError.style.display = 'none';
    registerSuccess.style.display = 'none';
    
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
    
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    
    registerSuccess.style.display = 'block';
    setTimeout(() => {
        registerSuccess.style.display = 'none';
    }, 2000);
    
    loadUserList();
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const loginError = document.getElementById('login-error');
    loginError.style.display = 'none';
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Mostra as seções principais
        document.querySelector('.main-sections').style.display = 'flex';
        document.querySelector('.drawer-container').style.display = 'block';
        document.getElementById('login-container').style.display = 'none';

        // Armazena o usuário logado
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
}

// Função para carregar as tarefas diárias
function carregarTarefasDiarias() {
    const hoje = new Date().toLocaleDateString();
    const ultimaAtualizacao = localStorage.getItem('ultimaAtualizacao');

    if (ultimaAtualizacao !== hoje) {
        const tarefas = tarefasDiarias.map(tarefa => ({
            tarefa,
            concluida: false
        }));
        localStorage.setItem('tarefasDiarias', JSON.stringify(tarefas));
        localStorage.setItem('ultimaAtualizacao', hoje);
    }

    const tarefas = JSON.parse(localStorage.getItem('tarefasDiarias')) || [];
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
    const tarefas = JSON.parse(localStorage.getItem('tarefasDiarias')) || [];
    if (!tarefas[index].concluida) {
        tarefas[index].concluida = true;
        const pontosAtuais = parseInt(localStorage.getItem('pontos')) || 0;
        localStorage.setItem('pontos', pontosAtuais + 10);
    }
    localStorage.setItem('tarefasDiarias', JSON.stringify(tarefas));
    carregarTarefasDiarias();
    atualizarPontos();
}

function adicionarTarefaDiaria() {
    const novaTarefa = document.getElementById('nova-tarefa-diaria').value.trim();
    if (novaTarefa !== '') {
        const tarefas = JSON.parse(localStorage.getItem('tarefasDiarias')) || [];
        tarefas.push({
            tarefa: novaTarefa,
            concluida: false
        });
        localStorage.setItem('tarefasDiarias', JSON.stringify(tarefas));
        carregarTarefasDiarias();
        document.getElementById('nova-tarefa-diaria').value = '';
    }
}

function carregarDados() {
    const notas = JSON.parse(localStorage.getItem('notas')) || [];
    const tarefasAdicionais = JSON.parse(localStorage.getItem('tarefasAdicionais')) || [];
    const links = JSON.parse(localStorage.getItem('links')) || [];

    const listaNotas = document.getElementById('lista-notas');
    const listaTarefasAdicionais = document.getElementById('lista-tarefas-adicionais');
    const listaLinks = document.getElementById('lista-links');

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
    const dados = JSON.parse(localStorage.getItem(tipo)) || [];
    dados.splice(index, 1);
    localStorage.setItem(tipo, JSON.stringify(dados));

    if (tipo === 'tarefasAdicionais') {
        const pontosAtuais = parseInt(localStorage.getItem('pontos')) || 0;
        localStorage.setItem('pontos', pontosAtuais + 5);
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

    const dados = JSON.parse(localStorage.getItem(tipo)) || [];
    dados.forEach((conteudo, index) => {
        const item = criarItemComBotao(conteudo, index, tipo, tipo === 'links');
        lista.appendChild(item);
    });
}

function adicionarNota() {
    const nota = document.getElementById('nova-nota').value.trim();
    if (nota !== '') {
        const notas = JSON.parse(localStorage.getItem('notas')) || [];
        notas.push(nota);
        localStorage.setItem('notas', JSON.stringify(notas));
        atualizarLista('notas');
        document.getElementById('nova-nota').value = '';
    }
}

function adicionarTarefaAdicional() {
    const tarefa = document.getElementById('nova-tarefa-adicional').value.trim();
    if (tarefa !== '') {
        const tarefasAdicionais = JSON.parse(localStorage.getItem('tarefasAdicionais')) || [];
        tarefasAdicionais.push(tarefa);
        localStorage.setItem('tarefasAdicionais', JSON.stringify(tarefasAdicionais));
        atualizarLista('tarefasAdicionais');
        document.getElementById('nova-tarefa-adicional').value = '';
    }
}

function adicionarLink() {
    const link = document.getElementById('novo-link').value.trim();
    if (link !== '') {
        const links = JSON.parse(localStorage.getItem('links')) || [];
        links.push(link);
        localStorage.setItem('links', JSON.stringify(links));
        atualizarLista('links');
        document.getElementById('novo-link').value = '';
    }
}

function toggleDrawer() {
    const drawerContent = document.getElementById('drawer-content');
    const drawerArrow = document.getElementById('drawer-arrow');

    drawerContent.classList.toggle('active');
    drawerArrow.textContent = drawerContent.classList.contains('active') ? '▲' : '▼';

    if (drawerContent.classList.contains('active')) {
        ajustarTamanhoTela();
    }
}

// Calendário
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('calendar-month-year');
    calendar.innerHTML = '';

    // Month and year display
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Day headers
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // Calculate first day of the month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty days before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        // Highlight current day
        const today = new Date();
        if (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        ) {
            dayElement.classList.add('current');
        }

        // Click event for days
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
    const largura = Math.min(parseInt(document.getElementById('largura-tela').value), 2000);
    const altura = Math.min(parseInt(document.getElementById('altura-tela').value), 1000);

    const calendar = document.getElementById('calendar');
    calendar.style.width = largura + 'px';
    calendar.style.height = altura + 'px';

    generateCalendar();
}

if (!localStorage.getItem('pontos')) {
    localStorage.setItem('pontos', '0');
}

function atualizarPontos() {
    const pontos = localStorage.getItem('pontos') || '0';
    document.getElementById('pontos').textContent = `Pontos: ${pontos}`;
}

// Inicialização
window.onload = () => {
    // Carrega a lista de usuários
    loadUserList();
    
    // Adiciona usuário padrão se não existir
    const users = getUsers();
    if (users.length === 0) {
        saveUsers([{ username: 'ParakeetPH12', password: '157751' }]);
        loadUserList();
    }
    
    // Sempre mostra o login ao carregar a página
    document.getElementById('login-container').style.display = 'block';
    document.querySelector('.main-sections').style.display = 'none';
    document.querySelector('.drawer-container').style.display = 'none';

    // Configura evento de redimensionamento responsivo
    window.addEventListener('resize', () => {
        if (document.getElementById('drawer-content').classList.contains('active')) {
            const calendar = document.getElementById('calendar');
            const proporcao = parseInt(document.getElementById('largura-tela').value) / parseInt(document.getElementById('altura-tela').value);
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
    generateCalendar();
}