const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3010;

app.use('/public', express.static('public'));
app.use('/style', express.static('style'));
app.use('/img', express.static('img'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'maxima-seguranca-confia',
    resave: false,
    saveUninitialized: true,
}));

const urlMongo = 'mongodb+srv://victor_sismotto:teste@loginfuture.9uxk4yr.mongodb.net/?appName=loginFuture';
const nomeBanco = 'loginFuture';

// ROTA PRINCIPAL
app.get('/', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const isLoggedIn = !!req.session.usuario;
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FUTURE - Work.In</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/style/inicial.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jockey+One&display=swap" rel="stylesheet">

</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="">
        <h4>
            <a href="/">Home</a>
            ${isLoggedIn ? '<a href="/planos">Planos e Preços</a><a href="/aprender">Aprender</a><a href="/parceria">Parceria</a><a href="/comunidade">Comunidade</a><a href="/suporte">Suporte</a><a href="/perfil">Perfil</a><a href="/logout">Logout</a>' : '<a href="/planos">Planos e Preços</a><a href="/aprender">Aprender</a><a href="/parceria">Parceria</a><a href="/comunidade">Comunidade</a><a href="/suporte">Suporte</a>'}
        </h4>
        <a href="/register"><button class="start">Começar</button></a>
    </nav>
    <div class="progress" role="progressbar">
        <div class="progress-bar" style="width: 0%"></div>
    </div>

    <main class="main">
        <img class="img1_logo" src="/img/image1.png" alt="Work.In Logo">
        <div class="hero-text">
            <p class="p1">Aumente suas chances no mercado de trabalho com</p>
            <p class="p2">Work.In</p>
        </div>
    </main>

    <a href="/login" class="login-button-container"><button class="footer_button">Login</button></a>

    <section class="features-section">
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="bi bi-cash-coin"></i>
                </div>
                <h3>Economize</h3>
                <p>Aprenda a cortar despesas e alcançar suas metas financeiras</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">
                    <i class="bi bi-clock"></i>
                </div>
                <h3>Controle suas finanças</h3>
                <p>Acompanhe seus gastos e veja para onde seu dinheiro está indo.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">
                    <i class="bi bi-pie-chart"></i>
                </div>
                <h3>Veja todas as movimentações</h3>
                <p>Histórico completo das suas transações, sem complicações.</p>
            </div>
        </div>
    </section>

    <section class="income-section">
        <h2 class="income-title">Controle sua <span class="bold">renda</span></h2>

        <div class="income-grid">
            <!-- Coluna Esquerda -->
            <div class="income-column">
                <div class="income-card" onclick="makeEditable(this)">
                    <div class="income-card-header">
                        <div>
                            <div class="income-card-title">Conta</div>
                            <input type="text" class="edit-input" value="Conta" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                            <div class="income-card-number">2101889945</div>
                            <input type="text" class="edit-input" value="2101889945" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                        </div>
                    </div>
                    <div class="income-value positive">2 311  BRL</div>
                    <input type="text" class="edit-input" value="2 311  BRL" onblur="saveCard(this.parentElement)">
                    <button class="save-btn" onclick="saveCard(this.parentElement)">Salvar</button>
                    <div class="income-chart">
                        <svg width="100%" height="60" viewBox="0 0 200 60">
                            <!-- Grid lines -->
                            <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                            <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                            <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                            <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                            <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                            <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                            <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                            <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                            <!-- Axes -->
                            <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                            <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                            <!-- Fill area -->
                            <polygon points="0,60 0,40 50,30 100,20 150,10 200,5 200,60" class="fill-area"/>
                            <!-- Line -->
                            <polyline points="0,40 50,30 100,20 150,10 200,5" fill="none" stroke="#00d4aa" stroke-width="3"/>
                        </svg>
                    </div>
                </div>

                <div class="income-card" onclick="makeEditable(this)">
                    <div class="income-card-header">
                        <div>
                            <div class="income-card-title">Poupança</div>
                            <input type="text" class="edit-input" value="Poupança" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                            <div class="income-card-number">2101889945</div>
                            <input type="text" class="edit-input" value="2101889945" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                        </div>
                    </div>
                    <div class="income-value negative">5 620  BRL</div>
                    <input type="text" class="edit-input" value="5 620  BRL" onblur="saveCard(this.parentElement)">
                    <button class="save-btn" onclick="saveCard(this.parentElement)">Salvar</button>
                    <div class="income-chart">
                        <svg width="100%" height="60" viewBox="0 0 200 60">
                            <!-- Grid lines -->
                            <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                            <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                            <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                            <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                            <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                            <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                            <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                            <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                            <!-- Axes -->
                            <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                            <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                            <!-- Fill area -->
                            <polygon points="0,60 0,10 50,15 100,25 150,40 200,50 200,60" class="fill-area"/>
                            <!-- Line -->
                            <polyline points="0,10 50,15 100,25 150,40 200,50" fill="none" stroke="#ff4444" stroke-width="3"/>
                        </svg>
                    </div>
                </div>

                <div class="income-card" onclick="makeEditable(this)">
                    <div class="income-card-header">
                        <div>
                            <div class="income-card-title">Carteira Familiar</div>
                            <input type="text" class="edit-input" value="Carteira Familiar" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                            <div class="income-card-number">2101889945</div>
                            <input type="text" class="edit-input" value="2101889945" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                        </div>
                    </div>
                    <div class="income-value positive">795  BRL</div>
                    <input type="text" class="edit-input" value="795  BRL" onblur="saveCard(this.parentElement)">
                    <button class="save-btn" onclick="saveCard(this.parentElement)">Salvar</button>
                    <div class="income-chart">
                        <svg width="100%" height="60" viewBox="0 0 200 60">
                            <!-- Grid lines -->
                            <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                            <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                            <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                            <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                            <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                            <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                            <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                            <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                            <!-- Axes -->
                            <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                            <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                            <!-- Fill area -->
                            <polygon points="0,60 0,45 50,35 100,40 150,25 200,15 200,60" class="fill-area"/>
                            <!-- Line -->
                            <polyline points="0,45 50,35 100,40 150,25 200,15" fill="none" stroke="#00d4aa" stroke-width="3"/>
                        </svg>
                    </div>
                </div>

                <button class="add-card-btn" onclick="addNewCard(this.parentElement)">
                    Adicionar uma nova carteira ou conta bancária
                </button>
            </div>

            <!-- Divisor -->
            <div class="divider-line"></div>

            <!-- Coluna Direita -->
            <div class="income-column">
                <div class="income-card" onclick="makeEditable(this)">
                    <div class="income-card-header">
                        <div>
                            <div class="income-card-title">Conta</div>
                            <input type="text" class="edit-input" value="Conta" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                            <div class="income-card-number">2101889945</div>
                            <input type="text" class="edit-input" value="2101889945" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                        </div>
                    </div>
                    <div class="income-value positive">2 311  BRL</div>
                    <input type="text" class="edit-input" value="2 311  BRL" onblur="saveCard(this.parentElement)">
                    <button class="save-btn" onclick="saveCard(this.parentElement)">Salvar</button>
                    <div class="income-chart">
                        <svg width="100%" height="60" viewBox="0 0 200 60">
                            <!-- Grid lines -->
                            <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                            <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                            <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                            <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                            <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                            <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                            <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                            <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                            <!-- Axes -->
                            <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                            <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                            <!-- Fill area -->
                            <polygon points="0,60 0,40 50,30 100,20 150,10 200,5 200,60" class="fill-area"/>
                            <!-- Line -->
                            <polyline points="0,40 50,30 100,20 150,10 200,5" fill="none" stroke="#00d4aa" stroke-width="3"/>
                        </svg>
                    </div>
                </div>

                <div class="income-card" onclick="makeEditable(this)">
                    <div class="income-card-header">
                        <div>
                            <div class="income-card-title">Poupança</div>
                            <input type="text" class="edit-input" value="Poupança" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                            <div class="income-card-number">2101889945</div>
                            <input type="text" class="edit-input" value="2101889945" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                        </div>
                    </div>
                    <div class="income-value negative">5 620  BRL</div>
                    <input type="text" class="edit-input" value="5 620  BRL" onblur="saveCard(this.parentElement)">
                    <button class="save-btn" onclick="saveCard(this.parentElement)">Salvar</button>
                    <div class="income-chart">
                        <svg width="100%" height="60" viewBox="0 0 200 60">
                            <!-- Grid lines -->
                            <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                            <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                            <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                            <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                            <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                            <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                            <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                            <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                            <!-- Axes -->
                            <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                            <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                            <!-- Fill area -->
                            <polygon points="0,60 0,10 50,15 100,25 150,40 200,50 200,60" class="fill-area"/>
                            <!-- Line -->
                            <polyline points="0,10 50,15 100,25 150,40 200,50" fill="none" stroke="#ff4444" stroke-width="3"/>
                        </svg>
                    </div>
                </div>

                <div class="income-card" onclick="makeEditable(this)">
                    <div class="income-card-header">
                        <div>
                            <div class="income-card-title">Carteira Familiar</div>
                            <input type="text" class="edit-input" value="Carteira Familiar" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                            <div class="income-card-number">2101889945</div>
                            <input type="text" class="edit-input" value="2101889945" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                        </div>
                    </div>
                    <div class="income-value positive">795  BRL</div>
                    <input type="text" class="edit-input" value="795  BRL" onblur="saveCard(this.parentElement)">
                    <button class="save-btn" onclick="saveCard(this.parentElement)">Salvar</button>
                    <div class="income-chart">
                        <svg width="100%" height="60" viewBox="0 0 200 60">
                            <!-- Grid lines -->
                            <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                            <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                            <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                            <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                            <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                            <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                            <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                            <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                            <!-- Axes -->
                            <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                            <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                            <!-- Fill area -->
                            <polygon points="0,60 0,45 50,35 100,40 150,25 200,15 200,60" class="fill-area"/>
                            <!-- Line -->
                            <polyline points="0,45 50,35 100,40 150,25 200,15" fill="none" stroke="#00d4aa" stroke-width="3"/>
                        </svg>
                    </div>
                </div>

                <button class="add-card-btn" onclick="addNewCard(this.parentElement)">
                    Adicionar uma nova carteira ou conta bancária
                </button>
            </div>
        </div>
    </section>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Set login status from server
        const isLoggedIn = ${JSON.stringify(isLoggedIn)};

        // Check login status on page load
        document.addEventListener('DOMContentLoaded', function() {
            if (!isLoggedIn) {
                applyLockOverlay();
            } else {
                removeLockOverlay();
            }
        });

        // Apply lock overlay to cards if not logged in
        function applyLockOverlay() {
            const cards = document.querySelectorAll('.income-card');
            cards.forEach(card => {
                const overlay = document.createElement('div');
                overlay.className = 'lock-overlay';
                overlay.innerHTML = '<i class="bi bi-lock-fill"></i><p>Faça login para acessar suas carteiras e contas.</p>';
                card.style.position = 'relative';
                card.style.pointerEvents = 'none';
                card.appendChild(overlay);
            });
        }

        // Remove lock overlay from cards if logged in
        function removeLockOverlay() {
            const cards = document.querySelectorAll('.income-card');
            cards.forEach(card => {
                const overlay = card.querySelector('.lock-overlay');
                if (overlay) {
                    overlay.remove();
                }
                card.style.pointerEvents = 'auto';
            });
        }

        // Function to add a new card
        function addNewCard(column) {
            if (!isLoggedIn) {
                alert('Você precisa estar logado para adicionar uma nova carteira.');
                return;
            }
            const newCard = document.createElement('div');
            newCard.className = 'income-card';
            newCard.onclick = function() { makeEditable(this); };
            newCard.innerHTML = \`
                <div class="income-card-header">
                    <div>
                        <div class="income-card-title">Nova Carteira</div>
                        <input type="text" class="edit-input" value="Nova Carteira" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                        <div class="income-card-number">0000000000</div>
                        <input type="text" class="edit-input" value="0000000000" onblur="saveCard(this.parentElement.parentElement.parentElement)">
                    </div>
                </div>
                <div class="income-value positive">0 BRL</div>
                <input type="text" class="edit-input" value="0 BRL" onblur="saveCard(this.parentElement)">
                <button class="save-btn" onclick="saveCard(this.parentElement)">Salvar</button>
                <div class="income-chart">
                    <svg width="100%" height="60" viewBox="0 0 200 60">
                        <!-- Grid lines -->
                        <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                        <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                        <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                        <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                        <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                        <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                        <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                        <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                        <!-- Axes -->
                        <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                        <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                        <!-- Fill area -->
                        <polygon points="0,60 0,30 50,30 100,30 150,30 200,30 200,60" class="fill-area"/>
                        <!-- Line -->
                        <polyline points="0,30 50,30 100,30 150,30 200,30" fill="none" stroke="#00d4aa" stroke-width="3"/>
                    </svg>
                </div>
            \`;
            // Insert before the add button
            const addBtn = column.querySelector('.add-card-btn');
            column.insertBefore(newCard, addBtn);
        }

        // Function to make card editable
        function makeEditable(card) {
            if (!isLoggedIn) {
                alert('Você precisa estar logado para editar as carteiras.');
                return;
            }
            card.classList.add('editing');
        }

        // Function to save card changes
        function saveCard(card) {
            const titleInput = card.querySelector('.edit-input[value="' + card.querySelector('.income-card-title').textContent + '"]');
            const numberInput = card.querySelector('.edit-input[value="' + card.querySelector('.income-card-number').textContent + '"]');
            const valueInput = card.querySelector('.edit-input[value="' + card.querySelector('.income-value').textContent + '"]');

            if (titleInput) card.querySelector('.income-card-title').textContent = titleInput.value;
            if (numberInput) card.querySelector('.income-card-number').textContent = numberInput.value;
            if (valueInput) card.querySelector('.income-value').textContent = valueInput.value;

            card.classList.remove('editing');
        }
    </script>
</body>
</html>
    `;
    res.send(html);
});

// ROTA ERRO
app.get('/erro', (req, res) => {
    res.sendFile(__dirname + '/public/erro.html');
});

// ROTA REGISTRAR

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/registro.html');
});

app.post('/register', async (req, res) => {
    const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });
    try{
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuarioExistente = await colecaoUsuarios.findOne({ usuario: req.body.usuario });

        if(usuarioExistente){
        htmlPage = 
        `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - FUTURE</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/style/erro.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jockey+One&display=swap" rel="stylesheet">
 
</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="FUTURE Logo">
        <h4>
            <a href="/">Home</a>
        </h4>
    </nav>
    <div class="progress" role="progressbar">
        <div class="progress-bar" style="width: 0%"></div>
    </div>

    <main class="main">
        <div class="error-card">
            <div class="error-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h1>Oops! Algo deu errado.</h1>
            <p>Parece que houve um problema com seu login. Verifique suas credenciais e tente novamente.</p>
            <img src="/img/image1.png" alt="Erro" class="error-image">
            <div class="btn-group">
                <a href="/login" class="btn-error btn-primary-error">Tentar Login Novamente</a>
                <a href="/register" class="btn-error btn-secondary-error">Registrar-se</a>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
        `;
        res.send(htmlPage);
        }
        else{
            const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);

            await colecaoUsuarios.insertOne({
                usuario: req.body.usuario,
                senha: senhaCriptografada
            });
            res.redirect('/login');
        }
    }
    catch (erro){
        htmlPage = 
        `
 <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - FUTURE</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/style/erro.css">
</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="FUTURE Logo">
        <h4>
            <a href="/">Home</a>
        </h4>
    </nav>
    <div class="progress" role="progressbar">
        <div class="progress-bar" style="width: 0%"></div>
    </div>

    <main class="main">
        <div class="error-card">
            <div class="error-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h1>Oops! Algo deu errado.</h1>
            <p>Parece que houve um problema com seu registro. Verifique suas credenciais e tente novamente.</p>
            <img src="/img/image1.png" alt="Erro" class="error-image">
            <div class="btn-group">
                <a href="/login" class="btn-error btn-primary-error">Tentar Login Novamente</a>
                <a href="/register" class="btn-error btn-secondary-error">Registrar-se</a>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
        `;
        res.send(htmlPage);
    }
    finally{
        cliente.close();
    }
});

// ROTA LOGIN:
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', async (req, res) => {
    const cliente  = new MongoClient(urlMongo, {useUnifiedTopology: true});
    try{
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuario = await colecaoUsuarios.findOne({ usuario: req.body.usuario });

        if(usuario && await bcrypt.compare(req.body.senha, usuario.senha)){
            req.session.usuario = req.body.usuario;
            res.redirect('/');
        }
        else{
            res.redirect('/erro');
        }
    }
    catch (erro){
        htmlPage = 
        `
 <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - FUTURE</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/style/erro.css">
</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="FUTURE Logo">
        <h4>
            <a href="/">Home</a>
        </h4>
    </nav>
    <div class="progress" role="progressbar">
        <div class="progress-bar" style="width: 0%"></div>
    </div>

    <main class="main">
        <div class="error-card">
            <div class="error-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h1>Oops! Algo deu errado.</h1>
            <p>Parece que houve um problema com seu login. Verifique suas credenciais e tente novamente.</p>
            <img src="/img/image1.png" alt="Erro" class="error-image">
            <div class="btn-group">
                <a href="/login" class="btn-error btn-primary-error">Tentar Login Novamente</a>
                <a href="/register" class="btn-error btn-secondary-error">Registrar-se</a>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
        `;
        res.send(htmlPage);
    }
    finally{
        cliente.close();
    }
});

// ROTA COM FUNÇÃO PARA USUÁRIOS LOGADOS:
function protegerRota(req, res, proximo){
    if(req.session.usuario){
        proximo();
    }
    else{
        res.redirect('/register');
    }
}

// ROTA LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

// ROTA PERFIL (PROTEGIDA)
app.get('/perfil', protegerRota, (req, res) => {
    const usuario = req.session.usuario;
    const html = `
 <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil - FUTURE</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Jockey+One&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100vh;
            background: radial-gradient(47.05% 26.2% at 89.13% 2.41%, rgba(79, 0, 132, 0.25) 0%, rgba(0, 0, 0, 0) 100%), 
                        linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), 
                        radial-gradient(68.54% 31.49% at -18.54% 39.83%, rgba(255, 255, 255, 0.2) 29.33%, rgba(0, 0, 0, 0) 100%), 
                        radial-gradient(74.86% 35.24% at 128.44% 28.27%, rgba(255, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 88.46%), 
                        radial-gradient(99.97% 29.93% at -34.38% -5.18%, rgba(254, 208, 97, 0.69) 0%, rgba(0, 0, 0, 0) 100%), 
                        linear-gradient(180deg, #253D56 0%, #1B2C3E 27.4%, #1B2C3E 63.7%, #000000 100%);
            display: flex;
            flex-direction: column;
            font-family: 'Arial', sans-serif;
        }

        .bar {
            margin-top: 30px;
            display: flex;
            align-items: center;
            padding: 0 40px;
            position: relative;
        }

        .img2_logo {
            width: 160px;
            height: 70px;
        }

        .bar h4 {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            margin: 0;
            margin-top: 20px;
        }

        .bar h4 a {
            color: white;
            text-decoration: none;
            margin: 0 20px;
            font-size: 19px;
            transition: all 0.3s ease;
            position: relative;
            font-family: 'Jockey One';
        }

        .bar h4 a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: #FFDD00;
            transition: width 0.3s ease;
        }

        .bar h4 a:hover {
            color: #FFDD00;
        }

        .bar h4 a:hover::after {
            width: 100%;
        }

        .progress {
            height: 5px;
            background: rgba(255, 255, 255, 0.1);
            margin-top: 10px;
        }

        .progress-bar {
            background: linear-gradient(90deg, #FFDD00, #FED061);
        }

        .main {
            flex: 1;
            padding: 80px 20px;
        }

        .page-title {
            color: white;
            text-align: center;
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 60px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            animation: fadeInDown 0.8s ease;
        }

        .profile-card {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 25px;
            padding: 50px 40px;
            max-width: 700px;
            margin: 0 auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: fadeInUp 0.8s ease;
        }

        .profile-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid rgba(255, 221, 0, 0.3);
        }

        .profile-avatar {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #FFDD00, #FED061);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 10px 30px rgba(255, 221, 0, 0.3);
        }

        .profile-avatar i {
            font-size: 60px;
            color: #1B2C3E;
        }

        .profile-card h5 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
        }

        .profile-card p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 17px;
            line-height: 1.6;
            margin-bottom: 25px;
        }

        .profile-info {
            background: rgba(255, 221, 0, 0.1);
            border: 1px solid rgba(255, 221, 0, 0.3);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
        }

        .profile-info p {
            margin-bottom: 0;
            font-size: 18px;
        }

        .profile-info strong {
            color: #FFDD00;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .profile-info #username {
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin-left: 10px;
        }

        .btn-logout {
            width: 100%;
            padding: 16px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 18px;
            border: 3px solid #ff4444;
            background: transparent;
            color: #ff4444;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .btn-logout:hover {
            background: rgba(255, 68, 68, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 68, 68, 0.3);
        }

        .stats-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat-item:hover {
            background: rgba(255, 221, 0, 0.1);
            border-color: #FFDD00;
            transform: translateY(-5px);
        }

        .stat-item i {
            font-size: 32px;
            color: #FFDD00;
            margin-bottom: 10px;
        }

        .stat-item .stat-value {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .stat-item .stat-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .bar {
                margin-top: 20px;
                padding: 0 20px;
                flex-wrap: wrap;
            }

            .img2_logo {
                width: 150px;
                height: 70px;
            }

            .bar h4 {
                position: static;
                transform: none;
                margin-top: 20px;
                width: 100%;
                text-align: center;
            }

            .bar h4 a {
                font-size: 16px;
                margin: 0 10px;
            }

            .page-title {
                font-size: 36px;
                margin-bottom: 40px;
            }

            .profile-card {
                padding: 40px 30px;
            }

            .stats-section {
                grid-template-columns: 1fr;
                gap: 15px;
            }
        }

        @media (max-width: 480px) {
            .page-title {
                font-size: 28px;
            }

            .profile-card {
                padding: 35px 25px;
            }

            .profile-avatar {
                width: 100px;
                height: 100px;
            }

            .profile-avatar i {
                font-size: 50px;
            }

            .profile-card h5 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="FUTURE Logo">
        <h4>
            <a href="/">Home</a>
            <a href="/planos">Planos e Preços</a>
            <a href="/aprender">Aprender</a>
            <a href="/parceria">Parceria</a>
            <a href="/comunidade">Comunidade</a>
            <a href="/suporte">Suporte</a>
        </h4>
    </nav>
    <div class="progress" role="progressbar">
        <div class="progress-bar" style="width: 0%"></div>
    </div>

    <main class="main">
        <h1 class="page-title">Perfil do Usuário</h1>
        
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="bi bi-person-fill"></i>
                </div>
                <h5>Bem-vindo ao seu perfil!</h5>
                <p>Aqui você pode gerenciar suas configurações e preferências.</p>
            </div>

            <div class="stats-section">
                <div class="stat-item">
                    <i class="bi bi-book"></i>
                    <div class="stat-value">12</div>
                    <div class="stat-label">Cursos</div>
                </div>
                <div class="stat-item">
                    <i class="bi bi-award"></i>
                    <div class="stat-value">8</div>
                    <div class="stat-label">Certificados</div>
                </div>
                <div class="stat-item">
                    <i class="bi bi-clock-history"></i>
                    <div class="stat-value">4.5h</div>
                    <div class="stat-label">Usando o site</div>
                </div>
            </div>

            <div class="profile-info">
                <p><strong>Usuário:</strong><span id="username">${usuario}</span></p>
            </div>

            <a href="/logout"><button class="btn-logout">Logout</button></a>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    </script>
</body>
</html>
    `;
    res.send(html);
});

// ROTAS PROTEGIDAS PARA USUÁRIOS LOGADOS
app.get('/planos', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/planos.html');
});

app.get('/aprender', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/aprender.html');
});

app.get('/parceria', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/parceria.html');
});

app.get('/comunidade', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/comunidade.html');
});

app.get('/suporte', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/suporte.html');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta: http://localhost:${port}/`);    
});
