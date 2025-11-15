const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3005;

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
app.get('/', async (req, res) => {
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Definir status de login a partir do servidor
        const isLoggedIn = ${JSON.stringify(isLoggedIn)};

        // Verificar status de login ao carregar a página
        document.addEventListener('DOMContentLoaded', function() {
            if (isLoggedIn) {
                // Load persisted cards for logged-in user
                fetch('/load-cards')
                    .then(r => r.json())
                    .then(data => {
                        const cards = data.cards || {};
                        // Create card elements dynamically from loaded data
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
        });

        let currentCard = null;

        // Function to add a new card
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
            // Insert before the add button
            const addBtn = column.querySelector('.add-card-btn');
            column.insertBefore(newCard, addBtn);

            // Persist the new card immediately
            const payload = { cardId, title: 'Nova Carteira', number: '0000000000', value: '0 BRL' };
            fetch('/save-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(r => r.json())
              .then(resp => console.log('New card saved', resp))
              .catch(err => console.error('Error saving new card', err));
        }

        // Function to open overlay
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

        // Function to update overlay chart and number display
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

            // Update card in real-time (mirror title, number, value and styles)
            if (currentCard) {
                const cardTitle = currentCard.querySelector('.income-card-title');
                const cardNumberEl = currentCard.querySelector('.income-card-number');
                const cardValue = currentCard.querySelector('.income-value');

                // Mirror fields
                cardTitle.textContent = document.getElementById('overlay-title').value;
                cardNumberEl.textContent = document.getElementById('overlay-number').value;
                cardValue.textContent = document.getElementById('overlay-value').value;

                // Apply classes/colors for positive / negative / neutral (zero)
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

        // Function to update card chart
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

        // Function to delete a card (called from delete button)
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

        // Function to save overlay changes
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
                cards: {}
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

// ROTA PARA SALVAR ALTERAÇÕES DO CARD
app.post('/save-card', async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    const { cardId, title, number, value } = req.body;
    const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });
    
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');
        
        // Create or update cards array in user document
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

    const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        // Remove the card field from the user's document
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

    const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });
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