const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use('/public', express.static('public'));
app.use('/style', express.static('style'));
app.use('/img', express.static('img'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'maxima-seguranca-confia',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hrs
        sameSite: 'lax'
    }
}));
// Middleware de debug para todas as requisições
app.use((req, res, next) => {
    console.log('\n=== REQUISIÇÃO ===');
    console.log('URL:', req.url);
    console.log('Método:', req.method);
    console.log('SessionID:', req.sessionID);
    console.log('Usuário na sessão:', req.session.usuario);
    console.log('==================\n');
    next();
});


const urlMongo = 'mongodb+srv://victor_sismotto:teste@loginfuture.9uxk4yr.mongodb.net/?appName=loginFuture';
const nomeBanco = 'loginFuture';


// ROTA PRINCIPAL
app.get('/', async (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const isLoggedIn = !!req.session.usuario;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WORKIN - Work.In</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/style/inicial.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jockey+One&display=swap" rel="stylesheet">
    <style>
        .overlay-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 99;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .overlay-backdrop.active {
            opacity: 1;
            visibility: visible;
        }
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        .overlay.active {
            display: flex;
        }
        .overlay-content {
            background: linear-gradient(135deg, #1B2C3E 0%, #253D56 100%);
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 2px solid rgba(255, 221, 0, 0.2);
            position: relative;
            animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        .close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            transition: color 0.3s;
        }
        .close-btn:hover {
            color: #FFDD00;
        }
        .overlay-header {
            margin-bottom: 20px;
        }
        .overlay-input {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            color: white;
            font-size: 16px;
            transition: all 0.3s;
        }
        .overlay-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.15);
            border-color: #FFDD00;
            box-shadow: 0 0 10px rgba(255, 221, 0, 0.3);
        }
        #overlay-number {
            font-size: 18px;
        }
        .overlay-chart {
            margin: 20px 0;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding: 15px;
        }
        .save-overlay-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(90deg, #FFDD00, #FED061);
            border: none;
            border-radius: 10px;
            color: #1B2C3E;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .save-overlay-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 221, 0, 0.3);
        }
        .overlay-value-display {
            color: white;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .card-delete {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255,255,255,0.08);
            color: #fff;
            border-radius: 8px;
            padding: 6px 8px;
            cursor: pointer;
            font-size: 14px;
            display: none;
            z-index: 5;
        }
        .income-card:hover .card-delete { display: block; }
        .positive-text {
            color: #00d4aa;
        }
        .negative-text {
            color: #ff4444;
        }
        .neutral-text {
            color: #FFDD00;
        }
        /* Chart grid and axis styling */
        .grid-line {
            stroke: rgba(255,255,255,0.06);
            stroke-width: 1;
        }
        .axis {
            stroke: rgba(255,255,255,0.12);
            stroke-width: 1.2;
        }
    </style>

</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="">
        <h4>
            <a href="/">Home</a>
            ${isLoggedIn ? '<a href="/planos">Planos e Preços</a><a href="/aprender">Aprender</a><a href="/parceria">Parceria</a><a href="/comunidade">Comunidade</a><a href="/suporte">Suporte</a>' : '<a href="/planos">Planos e Preços</a><a href="/aprender">Aprender</a><a href="/parceria">Parceria</a><a href="/comunidade">Comunidade</a><a href="/suporte">Suporte</a>'}
        </h4>
        ${isLoggedIn ? '<a href="/perfil"><button class="start">Perfil</button></a>' : '<a href="/register"><button class="start">Começar</button></a>'}
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

    ${isLoggedIn ? '' : '<a href="/login" style="text-decoration: none; display: flex; justify-content: center"><button class="footer_button" style="text-decoration: none;">Login</button></a>'}

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
                <button class="add-card-btn" onclick="addNewCard(this.parentElement)">
                    Adicionar uma nova carteira ou conta bancária
                </button>
            </div>

            <!-- Divisor -->
            <div class="divider-line"></div>

            <!-- Coluna Direita -->
            <div class="income-column">
                <button class="add-card-btn" onclick="addNewCard(this.parentElement)">
                    Adicionar uma nova carteira ou conta bancária
                </button>
            </div>
        </div>

        <!-- Overlay Modal -->
        <div id="overlay-backdrop" class="overlay-backdrop" onclick="closeOverlay()"></div>
        <div id="overlay" class="overlay" onclick="closeOverlay()">
            <div class="overlay-content" onclick="event.stopPropagation()">
                <button class="close-btn" onclick="closeOverlay()">×</button>
                <div class="overlay-header">
                    <input type="text" id="overlay-title" class="overlay-input" placeholder="Título" oninput="updateOverlayChart()">
                    <div class="overlay-value-display neutral-text" id="overlay-number-display">R$ 0</div>
                    <input type="text" id="overlay-number" class="overlay-input" placeholder="Número da conta" oninput="updateOverlayChart()">
                </div>
                <input type="text" id="overlay-value" class="overlay-input" placeholder="Valor (ex: 1000 BRL)" oninput="updateOverlayChart()">
                <div class="overlay-chart">
                    <svg id="overlay-svg" width="100%" height="200" viewBox="0 0 200 60">
                        <line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>
                        <line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>
                        <line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>
                        <line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>
                        <line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>
                        <line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>
                        <line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>
                        <line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>
                        <line x1="0" y1="60" x2="200" y2="60" class="axis"/>
                        <line x1="0" y1="0" x2="0" y2="60" class="axis"/>
                        <polygon points="0,60 0,30 50,30 100,30 150,30 200,30 200,60" class="fill-area" fill="rgba(255, 221, 0, 0.2)"/>
                        <polyline id="overlay-polyline" points="0,30 50,30 100,30 150,30 200,30" fill="none" stroke="#FFDD00" stroke-width="3"/>
                    </svg>
                </div>
                <button class="save-overlay-btn" onclick="saveOverlay()">Salvar</button>
            </div>
        </div>
    </section>

    <!-- Modal de Cálculo de Renda -->
    <div class="modal fade" id="incomeCalculatorModal" tabindex="-1" aria-labelledby="incomeCalculatorModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content" style="background: rgba(44, 62, 80, 0.95); border: 2px solid rgba(255, 255, 255, 0.1);">
                <div class="modal-header">
                    <h5 class="modal-title" id="incomeCalculatorModalLabel" style="color: white;">Calculadora de Renda e Microcrédito</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="incomeForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="region" class="form-label" style="color: white;">Região de Residência *</label>
                                    <select class="form-control" id="region" required>
                                        <option value="" style="background-color: black">Selecione...</option>
                                        <option value="norte" style="background-color: black">Norte</option>
                                        <option value="nordeste" style="background-color: black">Nordeste</option>
                                        <option value="centro-oeste" style="background-color: black">Centro-Oeste</option>
                                        <option value="sudeste" style="background-color: black">Sudeste</option>
                                        <option value="sul" style="background-color: black">Sul</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="salary" class="form-label" style="color: white;">Renda Salarial Mensal (R$) *</label>
                                    <input type="number" class="form-control" id="salary" min="0" step="0.01" required>
                                </div>
                                <div class="mb-3">
                                    <label for="bankFees" class="form-label" style="color: white;">Despesas Bancárias Mensais (R$) *</label>
                                    <input type="number" class="form-control" id="bankFees" min="0" step="0.01" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" style="color: white;">Tipos de Pagamento Efetuados *</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="pix" value="pix" name="paymentType">
                                        <label class="form-check-label" for="pix" style="color: white;">Pix</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="creditCard" value="creditCard" name="paymentType">
                                        <label class="form-check-label" for="creditCard" style="color: white;">Cartão de Crédito</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="debitCard" value="debitCard" name="paymentType">
                                        <label class="form-check-label" for="debitCard" style="color: white;">Cartão de Débito</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="paypal" value="paypal" name="paymentType">
                                        <label class="form-check-label" for="paypal" style="color: white;">PayPal</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="other" value="other" name="paymentType">
                                        <label class="form-check-label" for="other" style="color: white;">Outros</label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="frequency" class="form-label" style="color: white;">Frequência de Pagamentos</label>
                                    <select class="form-control" id="frequency" required>
                                        <option value="" style="background-color: black">Selecione...</option>
                                        <option value="monthly" style="background-color: black">Mensal</option>
                                        <option value="annual" style="background-color: black">Anual</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="text-center">
                            <button type="submit" class="btn btn-primary btn-lg" id="calculateBtn">Calcular</button>
                            <button type="button" class="btn btn-secondary btn-lg ms-3" id="recalculateBtn">Re-calcular Renda</button>
                        </div>
                    </form>

                    <!-- Loading Animation -->
                    <div id="loadingSection" class="text-center mt-4" style="display: none;">
                        <div class="progress mb-3">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%" id="progressBar"></div>
                        </div>
                        <p id="loadingMessage" style="color: white; font-size: 18px;">Calculando salário...</p>
                    </div>

                    <!-- Results Section -->
                    <div id="resultsSection" class="mt-4" style="display: none;">
                        <div class="card" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);">
                            <div class="card-body">
                                <h5 class="card-title" style="color: #00d4aa;">Resultado do Cálculo</h5>
                                <p id="microcreditResult" class="card-text" style="color: white;"></p>
                                <h6 style="color: #FFDD00;">Sugestões para Melhorar sua Faixa Salarial:</h6>
                                <ul id="suggestionsList" style="color: white;"></ul>
                                <div class="text-center mt-3">
                                    <button type="button" class="btn btn-secondary btn-lg" id="recalculateBtnResults">Re-calcular Renda</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    ${isLoggedIn ? `<!-- Botão Flutuante para Abrir Modal -->
    <button class="floating-btn" data-bs-toggle="modal" data-bs-target="#incomeCalculatorModal" style="position: fixed; bottom: 20px; left: 20px; width: 60px; height: 60px; background: linear-gradient(135deg, #FFDD00, #FED061); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000; border: none;">
    <i class="bi bi-calculator" style="font-size: 24px; color: #1B2C3E;"></i>
    </button>` : ''}



    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Definir status de login a partir do servidor
        const isLoggedIn = ${JSON.stringify(isLoggedIn)};

        // Verificar status de login ao carregar a página
        document.addEventListener('DOMContentLoaded', function() {
            if (isLoggedIn) {
                // Carregar cards do servidor para o usuário logado
                fetch('/load-cards')
                    .then(r => r.json())
                    .then(data => {
                        const cards = data.cards || {};
                        // Criar elementos de card dinamicamente a partir dos dados carregados
                        Object.keys(cards).forEach(id => {
                            const cardData = cards[id];
                            const leftCol = document.querySelector('.income-grid .income-column');
                            const newCard = document.createElement('div');
                            newCard.className = 'income-card';
                            newCard.setAttribute('data-card-id', id);
                            const titleText = cardData.title || 'Nova Carteira';
                            const numberText = cardData.number || '0000000000';
                            const valNum = parseFloat((cardData.value||'0').toString().replace(/[^0-9.-]/g,''));
                            const valClass = (isNaN(valNum) || valNum === 0) ? 'neutral' : (valNum > 0 ? 'positive' : 'negative');
                            const valText = cardData.value || '0 BRL';
                            newCard.innerHTML = '<div class="income-card-header">'
                                + '<div>'
                                    + '<div class="income-card-title">' + titleText + '</div>'
                                    + '<div class="income-card-number">' + numberText + '</div>'
                                + '</div>'
                            + '</div>'
                            + '<button class="card-delete" onclick="deleteCard(event,this)">🗑</button>'
                            + '<div class="income-value ' + valClass + '">' + valText + '</div>'
                            + '<div class="income-chart">'
                                + '<svg width="100%" height="60" viewBox="0 0 200 60">'
                                    + '<line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>' 
                                    + '<line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>' 
                                    + '<line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>' 
                                    + '<line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>' 
                                    + '<line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>' 
                                    + '<line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>' 
                                    + '<line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>' 
                                    + '<line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>' 
                                    + '<line x1="0" y1="60" x2="200" y2="60" class="axis"/>' 
                                    + '<line x1="0" y1="0" x2="0" y2="60" class="axis"/>' 
                                    + '<polygon class="fill-area" points="0,60 0,30 50,30 100,30 150,30 200,30 200,60"></polygon>' 
                                    + '<polyline points="0,30 50,30 100,30 150,30 200,30" fill="none" stroke="#00d4aa" stroke-width="3"></polyline>' 
                                + '</svg>'
                            + '</div>';
                            newCard.onclick = function() { openOverlay(this); };
                            leftCol.insertBefore(newCard, leftCol.querySelector('.add-card-btn'));
                            updateCardChart(newCard, valNum);
                        });
                    })
                    .catch(err => console.error('Erro ao carregar cards:', err));
            }

            // Inicializar formulário de cálculo de renda apenas para usuários logados
            if (isLoggedIn) {
                initializeIncomeCalculator();
            }
        });

        // Função para inicializar o formulário de cálculo de renda
        function initializeIncomeCalculator() {
        const incomeForm = document.getElementById('incomeForm');
        const loadingSection = document.getElementById('loadingSection');
        const resultsSection = document.getElementById('resultsSection');
        const progressBar = document.getElementById('progressBar');
        const loadingMessage = document.getElementById('loadingMessage');
        const microcreditResult = document.getElementById('microcreditResult');
        const suggestionsList = document.getElementById('suggestionsList');

        if (!incomeForm || !loadingSection || !resultsSection || !progressBar || !loadingMessage || !microcreditResult || !suggestionsList) {
            console.error('Um ou mais elementos do formulário de cálculo não foram encontrados no DOM.');
            return;
        }

        incomeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const region = document.getElementById('region')?.value;
            const salary = parseFloat(document.getElementById('salary')?.value);
            const bankFees = parseFloat(document.getElementById('bankFees')?.value);
            const paymentTypes = Array.from(document.querySelectorAll('input[name="paymentType"]:checked')).map(cb => cb.value);

            // Detecta frequência: tenta radio button primeiro, depois select
            let frequency = document.querySelector('input[name="frequency"]:checked')?.value;
            if (!frequency) {
                frequency = document.getElementById('frequency')?.value;
            }

            // Validação robusta
            if (!region || isNaN(salary) || isNaN(bankFees) || paymentTypes.length === 0 || !frequency) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Mostrar loading e esconder formulário/resultados
            incomeForm.style.display = 'none';
            loadingSection.style.display = 'block';
            resultsSection.style.display = 'none';

            const messages = [
                'Calculando salário...',
                'Efetuando algoritmo...',
                'Obtendo resultado final'
            ];

            let messageIndex = 0;
            let progress = 0;

            const loadingInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 100) progress = 100;
                progressBar.style.width = progress + '%';

                if (progress >= (messageIndex + 1) * 33.33) {
                    messageIndex++;
                    if (messageIndex < messages.length) {
                        loadingMessage.textContent = messages[messageIndex];
                    }
                }

                if (progress >= 100) {
                    clearInterval(loadingInterval);
                    setTimeout(() => {
                        showResults(region, salary, bankFees, paymentTypes, frequency);
                    }, 500);
                }
            }, 200);
        });

        const recalculateBtn = document.getElementById('recalculateBtn');
        recalculateBtn?.addEventListener('click', resetCalculator);

        const recalculateBtnResults = document.getElementById('recalculateBtnResults');
        recalculateBtnResults?.addEventListener('click', resetCalculator);

        function resetCalculator() {
            document.getElementById('region').value = '';
            document.getElementById('salary').value = '';
            document.getElementById('bankFees').value = '';
            document.querySelectorAll('input[name="paymentType"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('input[name="frequency"]').forEach(cb => cb.checked = false);
            const frequencySelect = document.getElementById('frequency');
            if (frequencySelect) frequencySelect.value = '';

            progressBar.style.width = '0%';
            loadingMessage.textContent = 'Calculando salário...';

            incomeForm.style.display = 'block';
            loadingSection.style.display = 'none';
            resultsSection.style.display = 'none';
        }

        function showResults(region, salary, bankFees, paymentTypes, frequency) {
            loadingSection.style.display = 'none';
            resultsSection.style.display = 'block';

            let baseCredit = salary * 0.3;
            let regionMultiplier = getRegionMultiplier(region);
            let paymentBonus = paymentTypes.length * 50;

            let microcredit = 0;

            if (frequency === 'annual') {
                microcredit = (baseCredit * regionMultiplier + paymentBonus) * 12 - bankFees * 12;
            } else if (frequency === 'monthly') {
                microcredit = (baseCredit * regionMultiplier + paymentBonus) - bankFees;
            }

            microcredit = Math.max(microcredit, 0);

            if (microcreditResult) {
                microcreditResult.textContent = 'Microcrédito Total: R$ ' + microcredit.toFixed(2);
            }

            suggestionsList.innerHTML = '';
            const suggestions = generateSuggestions(region, salary, bankFees, paymentTypes, frequency, microcredit);
            suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
        }

        function getRegionMultiplier(region) {
            const multipliers = {
                'norte': 1.2,
                'nordeste': 1.1,
                'centro-oeste': 1.15,
                'sudeste': 1.0,
                'sul': 1.05
            };
            return multipliers[region] || 1.0;
        }

        function generateSuggestions(region, salary, bankFees, paymentTypes, frequency, microcredit) {
            const suggestions = [];

            if (salary < 2000) suggestions.push('Considere buscar oportunidades de capacitação profissional para aumentar sua renda.');
            if (bankFees > salary * 0.05) suggestions.push('Avalie reduzir despesas bancárias optando por contas digitais gratuitas.');
            if (paymentTypes.length < 3) suggestions.push('Diversifique seus métodos de pagamento para maior flexibilidade financeira.');
            if (region === 'norte' || region === 'nordeste') suggestions.push('Explore programas regionais de microcrédito para empreendedores locais.');

            if (microcredit < 1000) {
                suggestions.push('Considere economizar mais para aumentar seu potencial de microcrédito.');
            } else {
                suggestions.push('Parabéns! Você tem um bom potencial para microcrédito. Considere investir em educação financeira.');
            }

            suggestions.push('Mantenha um histórico positivo de pagamentos para melhorar suas chances de aprovação.');
            suggestions.push('Monitore regularmente suas finanças para identificar oportunidades de melhoria.');

            return suggestions;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initializeIncomeCalculator();
    });





        let currentCard = null;

        // Função para adicionar um novo card
        function addNewCard(column) {
            if (!isLoggedIn) {
                alert('Você precisa estar logado para adicionar uma nova carteira.');
                return;
            }
            const cardId = 'card-' + Date.now();
            const newCard = document.createElement('div');
            newCard.className = 'income-card';
            newCard.setAttribute('data-card-id', cardId);
            newCard.onclick = function() { openOverlay(this); };
                newCard.innerHTML = ''
                    + '<div class="income-card-header">'
                        + '<div>'
                            + '<div class="income-card-title">Nova Carteira</div>'
                            + '<div class="income-card-number">0000000000</div>'
                        + '</div>'
                    + '</div>'
                    + '<button class="card-delete" onclick="deleteCard(event,this)">🗑</button>'
                    + '<div class="income-value neutral">0 BRL</div>'
                    + '<div class="income-chart">'
                        + '<svg width="100%" height="60" viewBox="0 0 200 60">'
                            + '<line x1="0" y1="10" x2="200" y2="10" class="grid-line"/>'
                            + '<line x1="0" y1="20" x2="200" y2="20" class="grid-line"/>'
                            + '<line x1="0" y1="30" x2="200" y2="30" class="grid-line"/>'
                            + '<line x1="0" y1="40" x2="200" y2="40" class="grid-line"/>'
                            + '<line x1="0" y1="50" x2="200" y2="50" class="grid-line"/>'
                            + '<line x1="50" y1="0" x2="50" y2="60" class="grid-line"/>'
                            + '<line x1="100" y1="0" x2="100" y2="60" class="grid-line"/>'
                            + '<line x1="150" y1="0" x2="150" y2="60" class="grid-line"/>'
                            + '<line x1="0" y1="60" x2="200" y2="60" class="axis"/>'
                            + '<line x1="0" y1="0" x2="0" y2="60" class="axis"/>'
                            + '<polygon points="0,60 0,30 50,30 100,30 150,30 200,30 200,60" class="fill-area"/>'
                            + '<polyline points="0,30 50,30 100,30 150,30 200,30" fill="none" stroke="#00d4aa" stroke-width="3"></polyline>'
                        + '</svg>'
                    + '</div>';
            // Inserir antes do botão de adicionar
            const addBtn = column.querySelector('.add-card-btn');
            column.insertBefore(newCard, addBtn);

            // Persistir o novo card imediatamente
            const payload = { cardId, title: 'Nova Carteira', number: '0000000000', value: '0 BRL' };
            fetch('/save-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(r => r.json())
              .then(resp => console.log('New card saved', resp))
              .catch(err => console.error('Error saving new card', err));
        }

        // Função para abrir o overlay
        function openOverlay(card) {
            if (!isLoggedIn) {
                alert('Você precisa estar logado para editar as carteiras.');
                return;
            }
            currentCard = card;
            const title = card.querySelector('.income-card-title').textContent;
            const number = card.querySelector('.income-card-number').textContent;
            const value = card.querySelector('.income-value').textContent;
            document.getElementById('overlay-title').value = title;
            document.getElementById('overlay-number').value = number;
            document.getElementById('overlay-value').value = value;
            document.getElementById('overlay').classList.add('active');
            document.getElementById('overlay-backdrop').classList.add('active');
            updateOverlayChart();
        }

        // Function to close overlay
        function closeOverlay() {
            document.getElementById('overlay').classList.remove('active');
            document.getElementById('overlay-backdrop').classList.remove('active');
            currentCard = null;
        }

        // Função para atualizar o gráfico e exibição do número no overlay
        function updateOverlayChart() {
            const valueText = document.getElementById('overlay-value').value;
            const numericValue = parseFloat(valueText.replace(/[^0-9.-]/g, ''));
            const displayEl = document.getElementById('overlay-number-display');
            const polyline = document.getElementById('overlay-polyline');
            const fillArea = document.getElementById('overlay-svg').querySelector('.fill-area');
            
            // Update number display with color
            if (isNaN(numericValue) || numericValue === 0) {
                displayEl.textContent = 'R$ 0';
                displayEl.className = 'overlay-value-display neutral-text';
            } else if (numericValue > 0) {
                displayEl.textContent = 'R$ ' + numericValue.toFixed(2);
                displayEl.className = 'overlay-value-display positive-text';
            } else {
                displayEl.textContent = 'R$ ' + numericValue.toFixed(2);
                displayEl.className = 'overlay-value-display negative-text';
            }

            // Update chart
            let strokeColor, points, fillPoints;
            if (isNaN(numericValue) || numericValue === 0) {
                strokeColor = '#FFDD00';
                points = '0,30 50,30 100,30 150,30 200,30';
                fillPoints = '0,60 0,30 50,30 100,30 150,30 200,30 200,60';
            } else if (numericValue > 0) {
                strokeColor = '#00d4aa';
                const steepness = Math.min(Math.abs(numericValue) / 100, 25);
                const startY = 50;
                const endY = Math.max(50 - steepness, 5);
                const y1 = startY - (startY - endY) * 0.25;
                const y2 = startY - (startY - endY) * 0.5;
                const y3 = startY - (startY - endY) * 0.75;
                points = '0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY;
                fillPoints = '0,60 0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY + ' 200,60';
            } else {
                strokeColor = '#ff4444';
                const steepness = Math.min(Math.abs(numericValue) / 100, 25);
                const startY = 10;
                const endY = Math.min(10 + steepness, 55);
                const y1 = startY + (endY - startY) * 0.25;
                const y2 = startY + (endY - startY) * 0.5;
                const y3 = startY + (endY - startY) * 0.75;
                points = '0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY;
                fillPoints = '0,60 0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY + ' 200,60';
            }

            polyline.setAttribute('points', points);
            polyline.setAttribute('stroke', strokeColor);
            fillArea.setAttribute('points', fillPoints);
            fillArea.setAttribute('fill', numericValue > 0 ? 'rgba(0, 212, 170, 0.2)' : numericValue < 0 ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 221, 0, 0.2)');

            // Atualização do card em tempo real
            if (currentCard) {
                const cardTitle = currentCard.querySelector('.income-card-title');
                const cardNumberEl = currentCard.querySelector('.income-card-number');
                const cardValue = currentCard.querySelector('.income-value');

                // Campo espelhado
                cardTitle.textContent = document.getElementById('overlay-title').value;
                cardNumberEl.textContent = document.getElementById('overlay-number').value;
                cardValue.textContent = document.getElementById('overlay-value').value;

                // Aplicar classes/cores para positivo / negativo / neutro (zero)
                if (isNaN(numericValue) || numericValue === 0) {
                    cardValue.className = 'income-value neutral';
                    cardNumberEl.style.color = '#FFDD00';
                } else if (numericValue > 0) {
                    cardValue.className = 'income-value positive';
                    cardNumberEl.style.color = '#00d4aa';
                } else {
                    cardValue.className = 'income-value negative';
                    cardNumberEl.style.color = '#ff4444';
                }

                updateCardChart(currentCard, numericValue);
            }
        }

        // Função para atualizar o gráfico do card
        function updateCardChart(card, numericValue) {
            const chart = card.querySelector('.income-chart svg');
            if (!chart) return;
            const polyline = chart.querySelector('polyline');
            const fillArea = chart.querySelector('.fill-area');
            let strokeColor, points, fillPoints;

            if (numericValue === 0 || isNaN(numericValue)) {
                strokeColor = '#FFDD00';
                points = '0,30 50,30 100,30 150,30 200,30';
                fillPoints = '0,60 0,30 50,30 100,30 150,30 200,30 200,60';
            } else if (numericValue > 0) {
                strokeColor = '#00d4aa';
                const steepness = Math.min(numericValue / 100, 25);
                const startY = 50;
                const endY = Math.max(50 - steepness, 5);
                const y1 = startY - (startY - endY) * 0.25;
                const y2 = startY - (startY - endY) * 0.5;
                const y3 = startY - (startY - endY) * 0.75;
                points = '0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY;
                fillPoints = '0,60 0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY + ' 200,60';
            } else {
                strokeColor = '#ff4444';
                const steepness = Math.min(Math.abs(numericValue) / 100, 25);
                const startY = 10;
                const endY = Math.min(10 + steepness, 55);
                const y1 = startY + (endY - startY) * 0.25;
                const y2 = startY + (endY - startY) * 0.5;
                const y3 = startY + (endY - startY) * 0.75;
                points = '0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY;
                fillPoints = '0,60 0,' + startY + ' 50,' + y1 + ' 100,' + y2 + ' 150,' + y3 + ' 200,' + endY + ' 200,60';
            }

            polyline.setAttribute('points', points);
            polyline.setAttribute('stroke', strokeColor);
            fillArea.setAttribute('points', fillPoints);
            fillArea.setAttribute('fill', numericValue > 0 ? 'rgba(0, 212, 170, 0.2)' : numericValue < 0 ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 221, 0, 0.2)');
        }

        // Função para excluir um card (chamada pelo botão de excluir)
        function deleteCard(evt, btn) {
            if (evt && evt.stopPropagation) evt.stopPropagation();
            const card = btn.closest('.income-card');
            if (!card) return;
            const cardId = card.getAttribute('data-card-id');
            if (!cardId) return;
            if (!confirm('Confirma excluir esta conta/carteira?')) return;

            fetch('/delete-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId })
            }).then(r => r.json())
              .then(data => {
                  if (data && data.success) {
                      // Remove card from DOM
                      card.remove();
                  } else {
                      alert('Erro ao excluir: ' + (data && data.message ? data.message : 'Erro desconhecido'));
                  }
              }).catch(err => {
                  console.error('Erro ao excluir card:', err);
                  alert('Erro ao excluir conta. Veja o console para detalhes.');
              });
        }

        // Função para salvar os dados do overlay
        function saveOverlay() {
            if (!currentCard) return;
            const title = document.getElementById('overlay-title').value;
            const number = document.getElementById('overlay-number').value;
            const value = document.getElementById('overlay-value').value;
            const cardId = currentCard.getAttribute('data-card-id');
            
            // Update card DOM
            currentCard.querySelector('.income-card-title').textContent = title;
            currentCard.querySelector('.income-card-number').textContent = number;
            currentCard.querySelector('.income-value').textContent = value;
            
            // Send to server to persist
            fetch('/save-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId, title, number, value })
            }).then(res => res.json())
              .then(data => console.log('Card saved:', data))
              .catch(err => console.error('Save error:', err));
            
            closeOverlay();
        }
    </script>
${isLoggedIn ? `<script>
document.addEventListener('DOMContentLoaded', function() {
// Calculator button
const calcButton = document.createElement('div');
calcButton.style.position = 'fixed';
calcButton.style.bottom = '20px';
calcButton.style.left = '20px';
calcButton.style.width = '60px';
calcButton.style.height = '60px';
calcButton.style.background = 'linear-gradient(135deg, #FFDD00, #FED061)';
calcButton.style.borderRadius = '50%';
calcButton.style.display = 'flex';
calcButton.style.alignItems = 'center';
calcButton.style.justifyContent = 'center';
calcButton.style.cursor = 'pointer';
calcButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
calcButton.style.zIndex = '1000';
calcButton.setAttribute('data-bs-toggle', 'modal');
calcButton.setAttribute('data-bs-target', '#incomeCalculatorModal');
calcButton.innerHTML = '<i class="bi bi-calculator" style="font-size: 24px; color: #1B2C3E;"></i>';
document.body.appendChild(calcButton);

});
</script><script>
(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="jxCxiLH-axFwvOPfEOgyP";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
</script>` : `<script>
document.addEventListener('DOMContentLoaded', function() {
  const button = document.createElement('div');
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.background = 'linear-gradient(135deg, #FFDD00, #FED061)';
  button.style.borderRadius = '50%';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  button.style.zIndex = '1000';
  button.innerHTML = '<i class="bi bi-chat-dots" style="font-size: 24px; color: #1B2C3E;"></i>';
  button.onclick = function() {
    alert('Você precisa de um cadastro ou estar logado no site para usar a IA "Mony", por favor, crie uma conta ou entre com uma conta pré-existente');
  };
  document.body.appendChild(button);
});
</script>`}
    <footer class="footer">
        <p>&copy; 2025 WORKIN. Todos os direitos reservados.</p>
    </footer>
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
    const cliente = new MongoClient(urlMongo);
    try{
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuarioExistente = await colecaoUsuarios.findOne({ usuario: req.body.usuario });

        if(usuarioExistente){
        const htmlPage = 
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
                senha: senhaCriptografada,
                cards: {},
                topics: []
            });

            res.redirect('/login');
        }
    }
    catch (erro){
        const htmlPage = 
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
        await cliente.close();
    }
});

// ROTA LOGIN:
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', async (req, res) => {
    const cliente = new MongoClient(urlMongo);
    try{
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuario = await colecaoUsuarios.findOne({ usuario: req.body.usuario });

        if(usuario && await bcrypt.compare(req.body.senha, usuario.senha)){
            req.session.usuario = req.body.usuario;
            req.session.loginTime = new Date();
            

            return req.session.save(err => {
                if (err) {
                    console.error('Erro ao salvar sessão durante o login:', err);
                    return res.redirect('/erro');
                }

                res.redirect('/');
            });
        }
        else{
            res.redirect('/erro');
        }
    }
    catch (erro){
        console.error('Erro no login:', erro); // Adicionado para debug
        const htmlPage = 
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
        await cliente.close();
    }
});

app.get('/get-profile-data', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    const loginTime = req.session.loginTime;
    const currentTime = new Date();
    const diffMs = currentTime - new Date(loginTime);
    
    // Converter para formato legível
    let timeString = '';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (days > 0) {
        timeString = `${days} dia${days > 1 ? 's' : ''}, ${hours}h`;
    } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`;
    } else {
        timeString = `${seconds}s`;
    }

    const cliente = new MongoClient(urlMongo);
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuarioDoc = await colecaoUsuarios.findOne({ usuario });
        const topics = usuarioDoc?.topics || [];
        const certifications = usuarioDoc?.certifications || [];

        // Contar certificados
        let certCount = 0;
        topics.forEach(topic => {
            if (topic.certifications) {
                certCount += topic.certifications.length;
            }
        });

        res.json({
            usuario,
            timeLoggedIn: timeString,
            courses: topics.length,
            certificates: certCount,
            loginTime: loginTime
        });
    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    } finally {
        await cliente.close();
    }
});

// ROTA COM FUNÇÃO PARA USUÁRIOS LOGADOS:
function protegerRota(req, res, proximo){
    console.log('PROTEGER ROTA CHAMADA');
    console.log('   URL:', req.url);
    console.log('   SessionID:', req.sessionID);
    console.log('   Usuário:', req.session.usuario);
    
    if(req.session.usuario){
        console.log('Acesso permitido');
        proximo();
    }
    else{
        console.log('Acesso negado - redirecionando para /register');
        res.redirect('/register');
    }
}

// ROTA PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO
app.get('/is-logged-in', (req, res) => {
    console.log('Verificando login via /is-logged-in');
    console.log('Usuário na sessão:', req.session.usuario);
    
    if (req.session.usuario) {
        res.json({ 
            loggedIn: true, 
            usuario: req.session.usuario 
        });
    } else {
        res.json({ 
            loggedIn: false 
        });
    }
});

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
    <title>Perfil - WORKIN</title>
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
            justify-content: space-between;
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

        .start {
            color: white;
            width: 170px;
            height: 60px;
            background: transparent;
            border: 3px solid #FFDD00;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease-in-out;
            font-weight: 600;
        }

        .start:hover {
            background-color: #ffef8835;
            transform: translateY(-2px);
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

        .stats-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-item {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }

        .stat-item:nth-child(1) { animation-delay: 0.1s; }
        .stat-item:nth-child(2) { animation-delay: 0.2s; }
        .stat-item:nth-child(3) { animation-delay: 0.3s; }
        .stat-item:nth-child(4) { animation-delay: 0.4s; }

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

        .profile-info #username, .profile-info #timeLogged {
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

        footer.footer {
            padding: 24px 0;
            text-align: center;
            color: rgba(255,255,255,0.7);
            font-size: 14px;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .loading {
            color: rgba(255, 255, 255, 0.6);
            text-align: center;
        }

        @media (max-width: 768px) {
            .bar {
                margin-top: 20px;
                padding: 0 20px;
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
            }

            .page-title {
                font-size: 36px;
            }

            .profile-card {
                padding: 40px 30px;
            }

            .stats-section {
                grid-template-columns: repeat(2, 1fr);
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

            .stats-section {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="WORKIN Logo">
        <h4>
            <a href="/">Home</a>
            <a href="/planos">Planos e Preços</a>
            <a href="/aprender">Aprender</a>
            <a href="/parceria">Parceria</a>
            <a href="/comunidade">Comunidade</a>
            <a href="/suporte">Suporte</a>
        </h4>
        <a href="/perfil"><button class="start">Perfil</button></a>
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
                <p>Aqui você pode acompanhar seu progresso na plataforma.</p>
            </div>

            <div class="stats-section">
                <div class="stat-item">
                    <i class="bi bi-book"></i>
                    <div class="stat-value" id="coursesCount">0</div>
                    <div class="stat-label">Cursos</div>
                </div>
                <div class="stat-item">
                    <i class="bi bi-award"></i>
                    <div class="stat-value" id="certificatesCount">0</div>
                    <div class="stat-label">Certificados</div>
                </div>
                <div class="stat-item">
                    <i class="bi bi-clock-history"></i>
                    <div class="stat-value" id="timeOnline">0</div>
                    <div class="stat-label">Tempo Online</div>
                </div>
                <div class="stat-item">
                    <i class="bi bi-chat-dots"></i>
                    <div class="stat-value" id="topicsCount">0</div>
                    <div class="stat-label">Tópicos</div>
                </div>
            </div>

            <div class="profile-info">
                <p><strong>Usuário:</strong><span id="username" class="loading">${usuario}</span></p>
            </div>

            <div class="profile-info">
                <p><strong>Tempo Logado:</strong><span id="timeLogged" class="loading">0</span></p>
            </div>

            <a href="/logout"><button class="btn-logout">Logout</button></a>
        </div>
        <footer class="footer">
            <p>&copy; 2025 WORKIN. Todos os direitos reservados.</p>
        </footer>        
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Buscar estatísticas do usuário
        fetch('/get-user-stats')
            .then(response => response.json())
            .then(data => {
                // Atualizar os valores na página
                document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = data.cursos || 0;
                document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = data.certificados || 0;
                document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = data.tempoOnline || '0h';
            })
            .catch(error => {
                console.error('Erro ao carregar estatísticas:', error);
            });
    });
</script>
</body>
</html>
    `;
    res.send(html);
});

app.get('/get-user-stats', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    const cliente = new MongoClient(urlMongo);
    
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');
        
        const usuarioDoc = await colecaoUsuarios.findOne({ usuario });
        
        if (!usuarioDoc) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Contar cursos concluídos (vamos considerar cada currículo criado como um curso)
        const cursosCount = usuarioDoc.curriculos ? usuarioDoc.curriculos.length : 0;
        
        // Contar tópicos criados
        const topicosCount = usuarioDoc.topics ? usuarioDoc.topics.length : 0;
        
        // Contar certificados (somando todos os certificados de todos os currículos)
        let certificadosCount = 0;
        if (usuarioDoc.curriculos) {
            usuarioDoc.curriculos.forEach(curriculo => {
                if (curriculo.certificacoes) {
                    // Contar quantas certificações existem no currículo
                    certificadosCount += Object.keys(curriculo.certificacoes).length;
                }
            });
        }
        
        // Tempo online (vamos calcular desde a criação da conta até agora)
        const accountCreated = usuarioDoc.createdAt || new Date();
        const now = new Date();
        const diffMs = now - new Date(accountCreated);
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const tempoOnline = `${diffHours}h`;
        
        res.json({
            cursos: cursosCount,
            topicos: topicosCount,
            certificados: certificadosCount,
            tempoOnline: tempoOnline
        });
        
    } catch (erro) {
        console.error('Erro ao buscar estatísticas:', erro);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA SALVAR ALTERAÇÕES DO CARD
app.post('/save-card', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    const { cardId, title, number, value } = req.body;
    const cliente = new MongoClient(urlMongo);
    
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');
        
        // Criar ou atualizar o array de cards no documento do usuário
        const resultado = await colecaoUsuarios.updateOne(
            { usuario },
            {
                $set: {
                    [`cards.${cardId}`]: {
                        id: cardId,
                        title,
                        number,
                        value,
                        updatedAt: new Date()
                    }
                }
            },
            { upsert: true }
        );
        
        res.json({ success: true, message: 'Card salvo com sucesso', resultado });
    } catch (erro) {
        console.error('Erro ao salvar card:', erro);
        res.status(500).json({ success: false, message: 'Erro ao salvar', erro: erro.message });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA DELETAR UM CARD
app.post('/delete-card', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const { cardId } = req.body;
    if (!cardId) return res.status(400).json({ success: false, message: 'cardId é obrigatório' });

    const cliente = new MongoClient(urlMongo);
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Remover o card do documento do usuário
        const resultado = await colecaoUsuarios.updateOne(
            { usuario },
            { $unset: { [`cards.${cardId}`]: "" } }
        );

        console.log('DELETE-CARD called by user:', usuario, 'cardId:', cardId, 'mongoResult:', resultado);

        res.json({ success: true, message: 'Card removido com sucesso', resultado });
    } catch (err) {
        console.error('Erro ao deletar card:', err);
        res.status(500).json({ success: false, message: 'Erro ao deletar card', erro: err.message });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA CARREGAR CARDS SALVOS PELO USUÁRIO
app.get('/load-cards', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) return res.json({ cards: {} });

    const cliente = new MongoClient(urlMongo);
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');
        const usuarioDoc = await colecaoUsuarios.findOne({ usuario });
        const cards = (usuarioDoc && usuarioDoc.cards) ? usuarioDoc.cards : {};
        res.json({ cards });
    } catch (err) {
        console.error('Erro ao buscar cards:', err);
        res.status(500).json({ cards: {} });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA SALVAR NOVO TÓPICO (CORRIGIDA)
// ROTA PARA SALVAR NOVO TÓPICO
app.post('/save-topic', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }
    
    const { title, content } = req.body;

    const newTopic = {
        id: Date.now().toString(),
        title: title,
        content: content,
        author: req.session.usuario,
        createdAt: new Date(),
        replies: []
    };
    
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { usuario: req.session.usuario }, 
            { $push: { topics: newTopic } }
        );

        if (result.matchedCount === 1) {
            res.json({ success: true, topicId: newTopic.id });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado para salvar o tópico.' });
        }

    } catch (error) {
        console.error('Erro ao salvar tópico:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar tópico.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA CARREGAR TÓPICOS
app.get('/load-topics', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'Usuário não logado', topics: [] });
    }
    
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const users = await colecaoUsuarios.find({}).toArray();

        const allTopics = [];
        users.forEach(user => {
            if (user.topics) {
                user.topics.forEach(topic => {
                    allTopics.push(topic);
                });
            }
        });

        res.json({ topics: allTopics });
    } catch (error) {
        console.error('Erro ao carregar tópicos:', error);
        res.status(500).json({ topics: [], error: 'Erro ao carregar tópicos' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA ABRIR UM TÓPICO ESPECÍFICO - CORRIGIDA
app.get('/topic/:topicId', protegerRota, async (req, res) => {
    const { topicId } = req.params;
    const usuarioLogado = req.session.usuario;
    
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Buscar o tópico em todos os usuários
        const users = await colecaoUsuarios.find({}).toArray();
        let topicData = null;
        let topicAuthor = null;

        for (const user of users) {
            if (user.topics) {
                const topic = user.topics.find(t => t.id === topicId);
                if (topic) {
                    topicData = topic;
                    topicAuthor = user.usuario;
                    break;
                }
            }
        }

        if (!topicData) {
            return res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Tópico não encontrado - WORKIN</title>
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
                        .start {
                            color: white;
                            width: 170px;
                            height: 60px;
                            background: transparent;
                            border: 3px solid #FFDD00;
                            border-radius: 30px;
                            cursor: pointer;
                            transition: all 0.3s ease-in-out;
                            font-weight: 600;
                        }
                        .start:hover {
                            background-color: #ffef8835;
                            transform: translateY(-2px);
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
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 60px 20px;
                        }
                        .error-content {
                            text-align: center;
                            color: white;
                        }
                        .error-content h1 {
                            font-size: 48px;
                            margin-bottom: 20px;
                            color: #FFDD00;
                        }
                        .error-content p {
                            font-size: 18px;
                            margin-bottom: 30px;
                            color: rgba(255, 255, 255, 0.8);
                        }
                        .error-content a {
                            display: inline-block;
                            padding: 15px 30px;
                            background: linear-gradient(90deg, #FFDD00, #FED061);
                            color: #1B2C3E;
                            text-decoration: none;
                            border-radius: 30px;
                            font-weight: 700;
                            transition: all 0.3s ease;
                        }
                        .error-content a:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 10px 25px rgba(255, 221, 0, 0.3);
                        }
                        footer.footer {
                            padding: 24px 0;
                            text-align: center;
                            color: rgba(255,255,255,0.7);
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <nav class="bar">
                        <img class="img2_logo" src="/img/image2.png" alt="WORKIN Logo">
                        <h4>
                            <a href="/">Home</a>
                            <a href="/planos">Planos e Preços</a>
                            <a href="/aprender">Aprender</a>
                            <a href="/parceria">Parceria</a>
                            <a href="/comunidade">Comunidade</a>
                            <a href="/suporte">Suporte</a>
                            <a href="/perfil">Perfil</a>
                        </h4>
                        <a href="/perfil"><button class="start">Perfil</button></a>
                    </nav>
                    <div class="progress" role="progressbar">
                        <div class="progress-bar" style="width: 0%"></div>
                    </div>
                    <main class="main">
                        <div class="error-content">
                            <h1>Tópico não encontrado</h1>
                            <p>O tópico que você está procurando não existe ou foi removido.</p>
                            <a href="/forum">← Voltar ao Fórum</a>
                        </div>
                    </main>
                    <footer class="footer">
                        <p>&copy; 2025 WORKIN. Todos os direitos reservados.</p>
                    </footer>
                </body>
                </html>
            `);
        }

        // Renderizar a página do tópico
        const repliesHtml = (topicData.replies || []).map(reply => `
            <div class="reply-card">
                <div class="reply-header">
                    <span class="reply-author">${reply.author}</span>
                    <span class="reply-date">${new Date(reply.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="reply-content">${reply.content}</div>
            </div>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${topicData.title} - WORKIN</title>
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
                    .start {
                        color: white;
                        width: 170px;
                        height: 60px;
                        background: transparent;
                        border: 3px solid #FFDD00;
                        border-radius: 30px;
                        cursor: pointer;
                        transition: all 0.3s ease-in-out;
                        font-weight: 600;
                    }
                    .start:hover {
                        background-color: #ffef8835;
                        transform: translateY(-2px);
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
                        padding: 60px 20px;
                    }
                    .container {
                        max-width: 1000px;
                        margin: 0 auto;
                    }
                    .topic-card {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border: 2px solid rgba(255, 255, 255, 0.2);
                        border-radius: 20px;
                        padding: 40px;
                        margin-bottom: 30px;
                    }
                    .topic-title {
                        color: #FFDD00;
                        font-size: 36px;
                        font-weight: 700;
                        margin-bottom: 20px;
                    }
                    .topic-meta {
                        display: flex;
                        gap: 30px;
                        margin-bottom: 30px;
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 14px;
                    }
                    .topic-content {
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 16px;
                        line-height: 1.8;
                        margin-bottom: 30px;
                    }
                    .replies-section {
                        margin-top: 40px;
                        padding-top: 40px;
                        border-top: 2px solid rgba(255, 255, 255, 0.2);
                    }
                    .replies-title {
                        color: white;
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 20px;
                    }
                    .reply-card {
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 15px;
                        padding: 20px;
                        margin-bottom: 15px;
                    }
                    .reply-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .reply-author {
                        color: #FFDD00;
                        font-weight: 600;
                    }
                    .reply-date {
                        color: rgba(255, 255, 255, 0.5);
                        font-size: 12px;
                    }
                    .reply-content {
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    .back-btn {
                        display: inline-block;
                        padding: 12px 25px;
                        background: rgba(255, 221, 0, 0.1);
                        border: 2px solid #FFDD00;
                        color: white;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        margin-bottom: 30px;
                    }
                    .back-btn:hover {
                        background: rgba(255, 221, 0, 0.2);
                        transform: translateY(-2px);
                    }
                    footer.footer {
                        padding: 24px 0;
                        text-align: center;
                        color: rgba(255,255,255,0.7);
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <nav class="bar">
                    <img class="img2_logo" src="/img/image2.png" alt="WORKIN Logo">
                    <h4>
                        <a href="/">Home</a>
                        <a href="/planos">Planos e Preços</a>
                        <a href="/aprender">Aprender</a>
                        <a href="/parceria">Parceria</a>
                        <a href="/comunidade">Comunidade</a>
                        <a href="/suporte">Suporte</a>
                        <a href="/perfil">Perfil</a>
                    </h4>
                    <a href="/perfil"><button class="start">Perfil</button></a>
                </nav>
                <div class="progress" role="progressbar">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>

                <main class="main">
                    <div class="container">
                        <a href="/forum" class="back-btn">← Voltar ao Fórum</a>

                        <div class="topic-card">
                            <h1 class="topic-title">${topicData.title}</h1>
                            
                            <div class="topic-meta">
                                <span><i class="bi bi-person"></i> ${topicData.author}</span>
                                <span><i class="bi bi-calendar"></i> ${new Date(topicData.createdAt).toLocaleDateString('pt-BR')}</span>
                                <span><i class="bi bi-chat-dots"></i> ${(topicData.replies || []).length} respostas</span>
                            </div>

                            <div class="topic-content">
                                ${topicData.content}
                            </div>
                        </div>

                        ${topicData.replies && topicData.replies.length > 0 ? `
                            <div class="replies-section">
                                <h3 class="replies-title">Respostas (${topicData.replies.length})</h3>
                                ${repliesHtml}
                            </div>
                        ` : `
                            <div class="replies-section">
                                <p style="color: rgba(255, 255, 255, 0.7); text-align: center;">Nenhuma resposta ainda. Seja o primeiro a responder!</p>
                            </div>
                        `}
                    </div>
                </main>

                <footer class="footer">
                    <p>&copy; 2025 WORKIN. Todos os direitos reservados.</p>
                </footer>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `;

        res.send(html);

    } catch (error) {
        console.error('Erro ao buscar tópico:', error);
        res.status(500).send('Erro ao carregar o tópico');
    } finally {
        await cliente.close();
    }
});

// ROTA PARA CARREGAR APENAS OS TÓPICOS DO USUÁRIO LOGADO
app.get('/load-my-topics', protegerRota, async (req, res) => {
    const usuarioNome = req.session.usuario;
    if (!usuarioNome) {
        return res.status(401).json({ topics: [] });
    }

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Encontra o usuário logado
        const usuarioDoc = await colecaoUsuarios.findOne({ usuario: usuarioNome });

        if (usuarioDoc && usuarioDoc.topics) {
            // Retorna apenas a array 'topics' desse usuário
            res.json({ topics: usuarioDoc.topics });
        } else {
            // Usuário encontrado, mas não tem tópicos
            res.json({ topics: [] });
        }
    } catch (error) {
        console.error('Erro ao carregar meus tópicos:', error);
        res.status(500).json({ topics: [] });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA CARREGAR RESPOSTAS DE UM TÓPICO
app.get('/load-replies/:topicId', async (req, res) => {
    const { topicId } = req.params;

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const users = await colecaoUsuarios.find({}).toArray();

        let replies = [];
        for (const user of users) {
            if (user.topics) {
                const topic = user.topics.find(t => t.id === topicId);
                if (topic) {
                    replies = topic.replies || [];
                    break;
                }
            }
        }

        res.json({ replies });
    } catch (error) {
        console.error('Erro ao carregar respostas:', error);
        res.status(500).json({ replies: [] });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA SALVAR RESPOSTA (CORRIGIDA)
app.post('/save-reply', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { topicId, replyContent } = req.body;

    const reply = {
        id: Date.now().toString(),
        content: replyContent,
        author: req.session.usuario,
        createdAt: new Date()
    };

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { 'topics.id': topicId },
            { $push: { 'topics.$.replies': reply } }
        );

        // *** AQUI ESTÁ A CORREÇÃO: Verifica se 1 documento foi atualizado ***
        if (result.matchedCount === 1) {
            res.json({ success: true });
        } else {
            // Caso em que o tópico não existe ou houve outro problema de correspondência
            res.status(404).json({ success: false, message: 'Tópico não encontrado ou erro na atualização.' });
        }
    } catch (error) {
        console.error('Erro ao salvar resposta:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar resposta.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA ATUALIZAR TÓPICO
app.put('/update-topic/:topicId', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { topicId } = req.params;
    const { title, content } = req.body;
    const usuarioLogado = req.session.usuario;

    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Título e conteúdo são obrigatórios' });
    }

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Garante que apenas o autor do tópico possa atualizá-lo
        const result = await colecaoUsuarios.updateOne(
            { 'topics.id': topicId, 'topics.author': usuarioLogado },
            { $set: { 'topics.$.title': title, 'topics.$.content': content } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Tópico não encontrado ou você não é o autor.' });
        }

        res.json({ success: true, message: 'Tópico atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar tópico:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao atualizar tópico.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA EXCLUIR TÓPICO
app.delete('/delete-topic/:topicId', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { topicId } = req.params;
    const usuarioLogado = req.session.usuario;

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Garante que apenas o autor do tópico possa excluí-lo
        const result = await colecaoUsuarios.updateOne(
            { 'topics.id': topicId, 'topics.author': usuarioLogado },
            { $pull: { topics: { id: topicId } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Tópico não encontrado ou você não é o autor.' });
        }

        res.json({ success: true, message: 'Tópico excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir tópico:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao excluir tópico.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA BUSCAR TODAS AS RESPOSTAS DO USUÁRIO
app.get('/user-replies', async (req, res) => {
    // 1. Verifica se o usuário está logado
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const usuarioLogado = req.session.usuario;
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // 2. Busca o documento do usuário logado
        const user = await colecaoUsuarios.findOne(
            { usuario: usuarioLogado },
            { projection: { 'topics': 1 } } // Busca apenas o campo 'topics'
        );

        if (!user || !user.topics) {
            return res.json({ success: true, replies: [] }); // Retorna lista vazia se não houver tópicos
        }

        let allReplies = [];

        // 3. Itera sobre os tópicos e extrai as respostas
        user.topics.forEach(topic => {
            if (topic.replies && topic.replies.length > 0) {
                // Filtra as respostas para incluir apenas as do usuário logado
                const userRepliesInTopic = topic.replies
                    .filter(reply => reply.author === usuarioLogado)
                    .map(reply => ({
                        topicId: topic.id,
                        topicTitle: topic.title, // Inclui o título do tópico para contexto
                        replyContent: reply.content,
                        createdAt: reply.createdAt
                    }));
                
                allReplies = allReplies.concat(userRepliesInTopic);
            }
        });

        // 4. Envia a lista de respostas
        res.json({ success: true, replies: allReplies });
    } catch (error) {
        console.error('Erro ao buscar respostas do usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA SALVAR CURRÍCULO
app.post('/save-curriculo', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const curriculoData = req.body;
    curriculoData.id = Date.now().toString();
    curriculoData.createdAt = new Date();
    curriculoData.updatedAt = new Date();
    
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Adicionar currículo ao array de currículos do usuário
        const result = await colecaoUsuarios.updateOne(
            { usuario: req.session.usuario }, 
            { $push: { curriculos: curriculoData } }
        );

        if (result.matchedCount === 1) {
            res.json({ success: true, curriculoId: curriculoData.id });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado para salvar o currículo.' });
        }

    } catch (error) {
        console.error('Erro ao salvar currículo:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar currículo.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA CARREGAR CURRÍCULOS DO USUÁRIO
app.get('/load-curriculos', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ curriculos: [] });
    }

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuarioDoc = await colecaoUsuarios.findOne({ usuario: req.session.usuario });

        if (usuarioDoc && usuarioDoc.curriculos) {
            res.json({ curriculos: usuarioDoc.curriculos });
        } else {
            res.json({ curriculos: [] });
        }
    } catch (error) {
        console.error('Erro ao carregar currículos:', error);
        res.status(500).json({ curriculos: [] });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA OBTER UM CURRÍCULO ESPECÍFICO
app.get('/get-curriculo/:id', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuarioDoc = await colecaoUsuarios.findOne({ usuario: req.session.usuario });

        if (usuarioDoc && usuarioDoc.curriculos) {
            const curriculo = usuarioDoc.curriculos.find(c => c.id === id);
            if (curriculo) {
                res.json({ curriculo });
            } else {
                res.status(404).json({ error: 'Currículo não encontrado' });
            }
        } else {
            res.status(404).json({ error: 'Nenhum currículo encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar currículo:', error);
        res.status(500).json({ error: 'Erro ao buscar currículo' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA ATUALIZAR CURRÍCULO
app.put('/update-curriculo/:id', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { id } = req.params;
    const curriculoData = req.body;
    curriculoData.updatedAt = new Date();

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { usuario: req.session.usuario, 'curriculos.id': id },
            { $set: { 'curriculos.$': curriculoData } }
        );

        if (result.matchedCount === 1) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Currículo não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao atualizar currículo:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao atualizar currículo.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA DELETAR CURRÍCULO
app.delete('/delete-curriculo/:id', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { id } = req.params;
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { usuario: req.session.usuario },
            { $pull: { curriculos: { id: id } } }
        );

        if (result.matchedCount === 1) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Currículo não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao deletar currículo:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao deletar currículo.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA SALVAR EVENTOS:
app.post('/save-event', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }
    
    const { title, description, date, time, location, type, image } = req.body;

    const newEvent = {
        id: Date.now().toString(),
        title: title,
        description: description,
        date: date,
        time: time,
        location: location,
        type: type,
        image: image || '',
        author: req.session.usuario,
        createdAt: new Date(),
        interested: [] // Array de usuários interessados
    };
    
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { usuario: req.session.usuario }, 
            { $push: { events: newEvent } }
        );

        if (result.matchedCount === 1) {
            res.json({ success: true, eventId: newEvent.id });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado para salvar o evento.' });
        }

    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar evento.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA CARREGAR TODOS OS EVENTOS
app.get('/load-events', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'Usuário não logado' });
    }
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const users = await colecaoUsuarios.find({}).toArray();

        const allEvents = [];
        users.forEach(user => {
            if (user.events) {
                user.events.forEach(event => {
                    allEvents.push(event);
                });
            }
        });

        res.json({ events: allEvents });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        res.status(500).json({ events: [] });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA ADICIONAR COMENTÁRIO EM EVENTO
 /* app.post('/add-event-comment', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { eventId, comment } = req.body;

    const newComment = {
        id: Date.now().toString(),
        text: comment,
        author: req.session.usuario,
        createdAt: new Date()
    };

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { 'events.id': eventId },
            { $push: { 'events.$.comments': newComment } }
        );

        if (result.matchedCount === 1) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Evento não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao adicionar comentário.' });
    } finally {
        await cliente.close();
    }
}); */

// ROTA PARA MARCAR PRESENÇA EM EVENTO
app.post('/api/toggle-attendance', protegerRota, async (req, res) => {
    const { eventId, userId } = req.body;
    let cliente;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'ID de usuário ausente.' });
    }

    try {
        cliente = await MongoClient.connect(urlMongo);
        const db = cliente.db(dbName);
        const eventosCollection = db.collection('eventos');
        
        const eventObjectId = new ObjectId(eventId);

        const event = await eventosCollection.findOne({ _id: eventObjectId });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
        }
        
        const isAttending = event.attendees && event.attendees.includes(userId);

        let updateResult;

        if (isAttending) {
            // Remove a presença
            updateResult = await eventosCollection.updateOne(
                { _id: eventObjectId },
                { $pull: { attendees: userId } }
            );
        } else {
            // Adiciona a presença
            updateResult = await eventosCollection.updateOne(
                { _id: eventObjectId },
                { $addToSet: { attendees: userId } }
            );
        }

        if (updateResult.modifiedCount === 1 || updateResult.matchedCount === 1) {
            res.json({ success: true, message: 'Presença atualizada com sucesso.' });
        } else {
            res.status(500).json({ success: false, message: 'Falha ao atualizar presença, tente novamente.' });
        }

    } catch (err) {
        console.error('Erro ao alternar presença:', err);
        res.status(500).json({ success: false, message: 'Erro interno ao marcar presença.' });
    } finally {
        if (cliente) await cliente.close();
    }
});

// ROTA PARA CARREGAR APENAS OS EVENTOS DO USUÁRIO LOGADO
app.get('/load-my-events', protegerRota, async (req, res) => {
    const usuarioNome = req.session.usuario;
    if (!usuarioNome) {
        return res.status(401).json({ events: [] });
    }

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuarioDoc = await colecaoUsuarios.findOne({ usuario: usuarioNome });

        if (usuarioDoc && usuarioDoc.events) {
            res.json({ events: usuarioDoc.events });
        } else {
            res.json({ events: [] });
        }
    } catch (error) {
        console.error('Erro ao carregar meus eventos:', error);
        res.status(500).json({ events: [] });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA VISUALIZAR UM EVENTO ESPECÍFICO
app.get('/event/:eventId', protegerRota, async (req, res) => {
    const { eventId } = req.params;
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const users = await colecaoUsuarios.find({}).toArray();
        let eventFound = null;

        for (const user of users) {
            if (user.events) {
                const event = user.events.find(e => e.id === eventId);
                if (event) {
                    eventFound = event;
                    break;
                }
            }
        }

        if (eventFound) {
            // Renderizar página do evento
            res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${eventFound.title} - WORKIN</title>
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
            justify-content: space-between;
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

        .start {
            color: white;
            width: 170px;
            height: 60px;
            background: transparent;
            border: 3px solid #FFDD00;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease-in-out;
            font-weight: 600;
        }

        .start:hover {
            background-color: #ffef8835;
            transform: translateY(-2px);
        }

        .main {
            flex: 1;
            padding: 60px 20px;
        }

        .event-container {
            max-width: 900px;
            margin: 0 auto;
        }

        .event-header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
        }

        .event-title {
            color: #FFDD00;
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 20px;
        }

        .event-image {
            width: 100%;
            max-height: 400px;
            object-fit: cover;
            border-radius: 15px;
            margin-bottom: 30px;
        }

        .event-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 16px;
        }

        .meta-item i {
            color: #FFDD00;
            font-size: 20px;
        }

        .event-description {
            background: rgba(255, 255, 255, 0.05);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }

        .event-description h3 {
            color: #FFDD00;
            margin-bottom: 15px;
        }

        .event-description p {
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.8;
            font-size: 16px;
        }

        .interest-section {
            background: rgba(255, 221, 0, 0.1);
            border: 2px solid rgba(255, 221, 0, 0.3);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
        }

        .interest-btn {
            padding: 15px 40px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 18px;
            border: 3px solid #FFDD00;
            background: transparent;
            color: white;
            transition: all 0.3s ease;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .interest-btn:hover {
            background: #ffef8835;
            transform: scale(1.05);
        }

        .interest-btn.interested {
            background: #FFDD00;
            color: #1B2C3E;
        }

        .interest-count {
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
        }

        .back-btn {
            display: inline-block;
            padding: 12px 30px;
            border-radius: 30px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: transparent;
            color: white;
            text-decoration: none;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }

        .back-btn:hover {
            border-color: #FFDD00;
            color: #FFDD00;
            transform: translateX(-5px);
        }

        footer.footer {
            padding: 24px 0;
            text-align: center;
            color: rgba(255,255,255,0.7);
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .bar {
                flex-direction: column;
                padding: 0 20px;
            }

            .bar h4 {
                position: static;
                transform: none;
                margin-top: 15px;
            }

            .event-title {
                font-size: 32px;
            }

            .event-header {
                padding: 25px;
            }
        }
    </style>
</head>
<body>
    <nav class="bar">
        <img class="img2_logo" src="/img/image2.png" alt="WORKIN Logo">
        <h4>
            <a href="/">Home</a>
            <a href="/planos">Planos e Preços</a>
            <a href="/aprender">Aprender</a>
            <a href="/parceria">Parceria</a>
            <a href="/comunidade">Comunidade</a>
            <a href="/suporte">Suporte</a>
        </h4>
        <a href="/perfil"><button class="start">Perfil</button></a>
    </nav>
    <div class="progress" role="progressbar">
        <div class="progress-bar" style="width: 0%"></div>
    </div>

    <main class="main">
        <div class="event-container">
            <a href="/comunidade" class="back-btn">
                <i class="bi bi-arrow-left"></i> Voltar aos Eventos
            </a>

            <div class="event-header">
                <h1 class="event-title">${eventFound.title}</h1>
                
                ${eventFound.image ? `<img src="${eventFound.image}" alt="${eventFound.title}" class="event-image">` : ''}
                
                <div class="event-meta">
                    <div class="meta-item">
                        <i class="bi bi-calendar"></i>
                        <span>${new Date(eventFound.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="meta-item">
                        <i class="bi bi-clock"></i>
                        <span>${eventFound.time}</span>
                    </div>
                    <div class="meta-item">
                        <i class="bi bi-geo-alt"></i>
                        <span>${eventFound.location}</span>
                    </div>
                    <div class="meta-item">
                        <i class="bi bi-tag"></i>
                        <span>${eventFound.type}</span>
                    </div>
                    <div class="meta-item">
                        <i class="bi bi-person"></i>
                        <span>Criado por ${eventFound.author}</span>
                    </div>
                </div>
            </div>

            <div class="event-description">
                <h3>Sobre o Evento</h3>
                <p>${eventFound.description}</p>
            </div>

            <div class="interest-section">
                <div class="interest-count">
                    <i class="bi bi-heart-fill"></i>
                    <span id="interestCount">${eventFound.interested ? eventFound.interested.length : 0}</span>
                    ${eventFound.interested && eventFound.interested.length === 1 ? 'pessoa interessada' : 'pessoas interessadas'}
                </div>
                <button class="interest-btn" id="interestBtn" onclick="toggleInterest()">
                    <i class="bi bi-heart"></i>
                    <span id="interestText">Tenho Interesse</span>
                </button>
            </div>
        </div>
    </main>

    <footer class="footer">
        <p>&copy; 2025 WORKIN. Todos os direitos reservados.</p>
    </footer>

    <script>
        const eventId = '${eventId}';
        const currentUser = '${req.session.usuario}';
        let interested = ${JSON.stringify(eventFound.interested || [])};

        // Verificar se o usuário já demonstrou interesse
        function checkUserInterest() {
            const btn = document.getElementById('interestBtn');
            const icon = btn.querySelector('i');
            const text = document.getElementById('interestText');
            
            if (interested.includes(currentUser)) {
                btn.classList.add('interested');
                icon.className = 'bi bi-heart-fill';
                text.textContent = 'Interessado';
            } else {
                btn.classList.remove('interested');
                icon.className = 'bi bi-heart';
                text.textContent = 'Tenho Interesse';
            }
        }

        // Alternar interesse
        function toggleInterest() {
            fetch('/toggle-interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    interested = data.interested;
                    document.getElementById('interestCount').textContent = interested.length;
                    checkUserInterest();
                } else {
                    alert(data.message || 'Erro ao registrar interesse');
                }
            })
            .catch(err => {
                console.error('Erro:', err);
                alert('Erro ao processar sua solicitação');
            });
        }

        // Inicializar
        checkUserInterest();
    </script>
</body>
</html>
            `);
        } else {
            res.status(404).send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Evento não encontrado - WORKIN</title>
                    <style>
                        body { 
                            background: #1B2C3E; 
                            color: white; 
                            font-family: Arial; 
                            padding: 40px;
                            text-align: center;
                        }
                        h1 { color: #FFDD00; }
                        a { 
                            display: inline-block;
                            margin-top: 20px;
                            padding: 12px 30px;
                            background: #FFDD00;
                            color: #1B2C3E;
                            text-decoration: none;
                            border-radius: 30px;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <h1>Evento não encontrado</h1>
                    <p>O evento que você procura não existe ou foi removido.</p>
                    <a href="/comunidade">← Voltar aos Eventos</a>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        res.status(500).send('Erro ao carregar evento');
    } finally {
        await cliente.close();
    }
});

// ROTA PARA ALTERNAR INTERESSE (CURTIR/DESCURTIR)
app.post('/toggle-interest', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { eventId } = req.body;
    const usuarioLogado = req.session.usuario;
    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Buscar o evento
        const users = await colecaoUsuarios.find({}).toArray();
        let eventOwner = null;
        let eventData = null;

        for (const user of users) {
            if (user.events) {
                const event = user.events.find(e => e.id === eventId);
                if (event) {
                    eventOwner = user.usuario;
                    eventData = event;
                    break;
                }
            }
        }

        if (!eventData) {
            return res.status(404).json({ success: false, message: 'Evento não encontrado' });
        }

        // Verificar se o usuário já está interessado
        const interested = eventData.interested || [];
        const userIndex = interested.indexOf(usuarioLogado);

        let result;
        if (userIndex > -1) {
            // Remover interesse
            result = await colecaoUsuarios.updateOne(
                { usuario: eventOwner, 'events.id': eventId },
                { $pull: { 'events.$.interested': usuarioLogado } }
            );
            interested.splice(userIndex, 1);
        } else {
            // Adicionar interesse
            result = await colecaoUsuarios.updateOne(
                { usuario: eventOwner, 'events.id': eventId },
                { $addToSet: { 'events.$.interested': usuarioLogado } }
            );
            interested.push(usuarioLogado);
        }

        if (result.matchedCount === 1) {
            res.json({ success: true, interested: interested });
        } else {
            res.status(500).json({ success: false, message: 'Erro ao atualizar interesse' });
        }

    } catch (error) {
        console.error('Erro ao alternar interesse:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao processar interesse' });
    } finally {
        await cliente.close();
    }
});

// 2. ROTA API PROTEGIDA para buscar detalhes de um evento específico pelo ID
app.get('/api/event-detail/:id', protegerRota, async (req, res) => {
    const eventId = req.params.id;
    let cliente;

    try {
        // ... (Conexão ao MongoDB, usando urlMongo e dbName) ...
        cliente = await MongoClient.connect(urlMongo);
        const db = cliente.db(dbName);
        const eventosCollection = db.collection('eventos');
        
        // Importante: Converte o ID string da URL para ObjectId do MongoDB
        const { ObjectId } = require('mongodb'); // Certifique-se que está no escopo, ou no topo do arquivo.
        const event = await eventosCollection.findOne({ _id: new ObjectId(eventId) });

        if (event) {
            res.json({ success: true, event });
        } else {
            res.status(404).json({ success: false, message: 'Evento não encontrado.' });
        }

    } catch (err) {
        console.error('Erro ao buscar detalhes do evento:', err);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    } finally {
        if (cliente) await cliente.close();
    }
});

// API para obter o ID do usuário logado
app.get('/api/get-current-user-id', protegerRota, (req, res) => {
    if (req.session.usuario && req.session.usuario._id) {
        res.json({ success: true, userId: req.session.usuario._id.toString() }); 
    } else {
        // Se a rota for protegida, esta linha será ignorada, pois o protegerRota 
        // já teria impedido o acesso ou redirecionado.
        res.status(401).json({ success: false, message: 'Não autenticado.' });
    }
});

// ROTA PARA ATUALIZAR EVENTO
app.put('/update-event/:eventId', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { eventId } = req.params;
    const { title, description, date, time, location, type, image } = req.body;
    const usuarioLogado = req.session.usuario;

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { 'events.id': eventId, 'events.author': usuarioLogado },
            { 
                $set: { 
                    'events.$.title': title,
                    'events.$.description': description,
                    'events.$.date': date,
                    'events.$.time': time,
                    'events.$.location': location,
                    'events.$.type': type,
                    'events.$.image': image
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Evento não encontrado ou você não é o criador.' });
        }

        res.json({ success: true, message: 'Evento atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao atualizar evento.' });
    } finally {
        await cliente.close();
    }
});

// ROTA PARA EXCLUIR EVENTO
app.delete('/delete-event/:eventId', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ success: false, message: 'Usuário não logado' });
    }

    const { eventId } = req.params;
    const usuarioLogado = req.session.usuario;

    const cliente = new MongoClient(urlMongo);

    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const result = await colecaoUsuarios.updateOne(
            { 'events.id': eventId, 'events.author': usuarioLogado },
            { $pull: { events: { id: eventId } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Evento não encontrado ou você não é o criador.' });
        }

        res.json({ success: true, message: 'Evento excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao excluir evento.' });
    } finally {
        await cliente.close();
    }
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

app.get('/cursos', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/cursos.html');
});

app.get('/curriculos', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/curriculos.html');
});

// ROTA PARA PÁGINA DO FÓRUM (USANDO PROTEÇÃO DE ROTA)
app.get('/forum', (req, res) => {  // sem protegerRota aqui
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(__dirname + '/public/forum.html');
});

app.get('/eventos', protegerRota, (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(__dirname + '/public/eventos.html');
});

app.get('/my-events', protegerRota, (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(__dirname + '/public/my-events.html')
});

app.get('/my-curriculums', (req, res) => {
    res.sendFile(__dirname + '/public/my-curriculums.html');
});

app.get('/event-detail.html', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/public/event-detail.html');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta: http://localhost:${port}/`);
});
