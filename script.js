// ================== CREDENCIAIS ================== 
const USERS = {
  admin: { user: 'admin', pass: '123', role: 'admin' },
  aluno1: { user: '2023123isinf0001', pass: 'aluno1', role: 'aluno' },
  aluno2: { user: '2023123isinf0002', pass: 'aluno2', role: 'aluno' }
};

let usuarioLogado = null;
const app = document.getElementById('app');

// ================== LOCALSTORAGE ==================
function getDenuncias() {
  return JSON.parse(localStorage.getItem('denuncias')) || [];
}

function saveDenuncia(d) {
  const lista = getDenuncias();
  lista.push(d);
  localStorage.setItem('denuncias', JSON.stringify(lista));
}

function updateDenuncias(lista) {
  localStorage.setItem('denuncias', JSON.stringify(lista));
}

// ================== LOGIN ==================
function renderLogin() {
  app.innerHTML = `
    <div class="carousel-space">
      <img src="carousel2.png" alt="Imagem institucional">
    </div>

    <div class="container card">
      <h1>Login</h1>

      <label>Usuário</label>
      <input id="user">

      <label>Senha</label>
      <input id="pass" type="password">

      <button onclick="login()">Entrar</button>
    </div>

    <img src="login.png" class="login-img" alt="Imagem Login">
  `;
}

function login() {
  const u = user.value;
  const p = pass.value;

  const aluno = Object.values(USERS).find(
    x => x.user === u && x.pass === p && x.role === 'aluno'
  );

  if (u === USERS.admin.user && p === USERS.admin.pass) {
    usuarioLogado = 'ADMIN';
    renderAdmin();
  } else if (aluno) {
    usuarioLogado = aluno.user;
    renderAluno();
  } else {
    alert('Credenciais inválidas');
  }
}

// ================== ÁREA DO ALUNO ==================
function renderAluno() {
  app.innerHTML = `
    <div class="container">
      <h1>Área do Aluno</h1>

      <div class="nav">
        <div class="nav-left">
          <button onclick="renderDenunciaForm()">Fazer Denúncia</button>
          <button onclick="renderHistoricoAluno()">Minhas Denúncias</button>
        </div>

        <div class="nav-right">
          <button class="logout-btn" onclick="renderLogin()">Logout</button>
        </div>
      </div>

      <div id="content"></div>
    </div>
  `;
}

function renderDenunciaForm() {
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="card">
      <h2>Nova Denúncia</h2>

      <label>Tipo</label>
      <select id="tipo">
        <option>Bullying</option>
        <option>Assédio</option>
        <option>Violência</option>
        <option>Discriminação</option>
        <option>Outros</option>
      </select>

      <label>Descrição</label>
      <textarea id="desc"></textarea>

      <label>Data da denúncia</label>
      <input type="date" id="data">

      <label>Prova</label>
      <input type="file" id="prova">

      <label>
        <input type="checkbox" id="anon"> Enviar anonimamente
      </label>

      <button onclick="enviarDenuncia()">Enviar Denúncia</button>
    </div>
  `;
}

function enviarDenuncia() {
  if (!desc.value || !data.value) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }

  const file = prova.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function () {
      salvarDenuncia(reader.result, file.name);
    };

    reader.readAsDataURL(file);
  } else {
    salvarDenuncia('', '');
  }
}

function salvarDenuncia(imagemBase64, nomeArquivo) {
  const denuncia = {
    id: Date.now(),
    aluno: usuarioLogado,
    tipo: tipo.value,
    descricao: desc.value,
    data: data.value,
    prova: nomeArquivo,
    imagem: imagemBase64,
    anonima: anon.checked,
    status: 'Pendente'
  };

  saveDenuncia(denuncia);
  alert(`Denúncia enviada!\nID: ${denuncia.id}`);
  renderAluno();
}

function renderHistoricoAluno() {
  const content = document.getElementById('content');
  const lista = getDenuncias().filter(d => d.aluno === usuarioLogado);

  content.innerHTML = lista.length
    ? lista.map(d => `
        <div class="card">
          <p><b>ID:</b> ${d.id}</p>
          <p><b>Tipo:</b> ${d.tipo}</p>
          <p><b>Data:</b> ${d.data}</p>
          <p><b>Status:</b> ${d.status}</p>
        </div>
      `).join('')
    : 'Nenhuma denúncia encontrada.';
}

// ================== ÁREA DO ADMIN ==================
function renderAdmin() {
  app.innerHTML = `
    <div class="container">
      <h1>Painel Administrativo</h1>

      <div class="nav">
        <div class="nav-left">
          <button onclick="listarPendentes()">Denúncias Pendentes</button>
          <button onclick="listarHistorico()">Histórico</button>
        </div>

        <div class="nav-right">
          <button class="logout-btn" onclick="renderLogin()">Logout</button>
        </div>
      </div>

      <div id="content"></div>
    </div>
  `;
}

// (resto do código permanece igual)
function listarPendentes() {
  const content = document.getElementById('content');
  const lista = getDenuncias().filter(d => d.status === 'Pendente');

  content.innerHTML = lista.length
    ? lista.map(d => `
        <div class="card">
          <b>ID:</b> ${d.id} | ${d.tipo}
          <button onclick="abrir(${d.id})">Abrir</button>
        </div>
      `).join('')
    : 'Nenhuma denúncia pendente.';
}

function abrir(id) {
  const content = document.getElementById('content');
  const d = getDenuncias().find(x => x.id === id);

  content.innerHTML = `
    <div class="card">
      <p><b>ID:</b> ${d.id}</p>
      <p><b>Aluno:</b> ${d.anonima ? 'Anônimo' : d.aluno}</p>
      <p><b>Tipo:</b> ${d.tipo}</p>
      <p><b>Data:</b> ${d.data}</p>
      <p><b>Descrição:</b> ${d.descricao}</p>

      <p><b>Prova:</b> ${d.prova || 'Nenhuma'}</p>

      ${
        d.imagem
          ? `<img src="${d.imagem}" class="prova-img" alt="Prova">`
          : '<p>Sem imagem anexada</p>'
      }

      <button onclick="mudarStatus(${id}, 'Resolvida')">Marcar como Resolvida</button>
      <button onclick="mudarStatus(${id}, 'Arquivada')">Arquivar</button>
    </div>
  `;
}

function mudarStatus(id, status) {
  const lista = getDenuncias();
  const d = lista.find(x => x.id === id);
  d.status = status;
  updateDenuncias(lista);
  listarPendentes();
}

function listarHistorico() {
  const content = document.getElementById('content');
  const lista = getDenuncias().filter(d => d.status !== 'Pendente');

  content.innerHTML = lista.length
    ? lista.map(d => `
        <div class="card status-${d.status.toLowerCase()}">
          <p><b>ID:</b> ${d.id}</p>
          <p><b>Tipo:</b> ${d.tipo}</p>
          <p><b>Aluno:</b> ${d.anonima ? 'Anônimo' : d.aluno}</p>
          <p><b>Data:</b> ${d.data}</p>
          <p><b>Anônimo:</b> ${d.anonima ? 'Sim' : 'Não'}</p>
          <p><b>Status:</b> ${d.status}</p>
        </div>
      `).join('')
    : 'Sem histórico.';
}

renderLogin();
