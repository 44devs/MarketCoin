let money = 0;
let fans = 0;
let isLaunched = false;
let currentView = 0;
let hasCrashed = false;
let selectedCoin = "Bitcoin";

const coinSymbols = {
    Bitcoin: "₿",
    Ethereum: "Ξ",
    Solana: "◎",
    DogeCoin: "Ð"
};

let rebirthLevel = 0;
let rebirthMultiplier = 1;
const rebirthReqs = [1000, 4000, 10000, 100000, 1000000];
const TOTAL_PAGES = 4;
let lastRebirthNotified = -1;

let boomPhaseActive = false;
let boomPhaseTimer = 0;
const BOOM_PHASE_DURATION = 60;

let regulatorTimer = 0;
const REGULATOR_INTERVAL = 60;

let hackerActive = false;
let hackerTimer = 0;
let hackerSpawnCooldown = 30;

let gameInterval;
let notificationInterval;
let topTimeout;
let achTimeout;

let currentShopPage = 0;
let shopLevels = {};

let competitors = [];
let nextCompetitorId = 1;
let competitorSpawnTimer = 0;
const MAX_COMPETITORS = 3;
const COMPETITOR_NAMES = ['CryptoCorp', 'Blockchain Bros', 'MoonShot Inc', 'Degen Capital', 'RugPull Co', 'Pump & Dump', 'Whale Alert', 'FOMO Fund', 'HODL Holdings', 'Stonks Ltd', 'Wolf of Web3', 'Token Titans'];

function getDifficultyData() {
    const r = rebirthLevel;
    return {
        crashChance: 0.01 + r * 0.005,
        crashSeverity: 0.5 + Math.min(0.2, r * 0.05),
        competitorSpawnInterval: Math.max(15, 45 - r * 5),
        competitorGrowth: 1.5 + r * 0.5,
        competitorHits: r >= 3 ? 2 : 1,
        regulatorActive: r >= 4,
        megaCorpActive: r >= 5,
        hackerUnlocked: r >= 2
    };
}

const clickerShopItems = [
    { id: 'c1', name: 'Upgrade Click', desc: '+1 click power per level', baseCost: 10, costMult: 1.5, req: 0, type: 'clickAdd', val: 1 },
    { id: 'c2', name: 'Better Mouse', desc: '+3 click power per level', baseCost: 100, costMult: 1.6, req: 0, type: 'clickAdd', val: 3 },
    { id: 'c3', name: 'Ergonomic Chair', desc: '+15 click power per level', baseCost: 1500, costMult: 1.7, req: 0, type: 'clickAdd', val: 15 },
    { id: 'c4', name: 'Coffee Machine', desc: '+75 click power per level', baseCost: 20000, costMult: 1.8, req: 0, type: 'clickAdd', val: 75 },
    { id: 'c5', name: 'Auto-Clicker', desc: '+5 money/sec per level', baseCost: 5000, costMult: 1.6, req: 1, type: 'moneyPassive', val: 5 },
    { id: 'c6', name: 'Clicking Bot', desc: '+30 money/sec per level', baseCost: 50000, costMult: 1.7, req: 1, type: 'moneyPassive', val: 30 },
    { id: 'c7', name: 'Macro Script', desc: '+200 money/sec per level', baseCost: 500000, costMult: 1.8, req: 1, type: 'moneyPassive', val: 200 },
    { id: 'c8', name: 'AI Assistant', desc: '+2000 money/sec per level', baseCost: 5000000, costMult: 2.0, req: 1, type: 'moneyPassive', val: 2000 },
    { id: 'c9', name: 'Golden Euro', desc: 'x1.5 click power (stacks)', baseCost: 500000, costMult: 2.2, req: 2, type: 'clickMult', val: 1.5 },
    { id: 'c10', name: 'Diamond Hands', desc: 'x2 click power (stacks)', baseCost: 2500000, costMult: 2.3, req: 2, type: 'clickMult', val: 2 },
    { id: 'c11', name: 'Insider Trading', desc: 'x1.5 money multiplier (stacks)', baseCost: 15000000, costMult: 2.4, req: 2, type: 'moneyMult', val: 1.5 },
    { id: 'c12', name: 'Hedge Fund', desc: 'x2 money multiplier (stacks)', baseCost: 75000000, costMult: 2.5, req: 2, type: 'moneyMult', val: 2 },
    { id: 'c13', name: 'Crypto Miner', desc: 'x3 all money (stacks)', baseCost: 500000000, costMult: 2.8, req: 3, type: 'moneyMult', val: 3 },
    { id: 'c14', name: 'Quantum Computer', desc: 'x5 all money (stacks)', baseCost: 2500000000, costMult: 3.0, req: 3, type: 'moneyMult', val: 5 },
    { id: 'c15', name: 'Time Machine', desc: 'x10 all money (stacks)', baseCost: 15000000000, costMult: 3.2, req: 3, type: 'moneyMult', val: 10 },
    { id: 'c16', name: 'Money Printer', desc: 'x25 all money (stacks)', baseCost: 75000000000, costMult: 3.5, req: 3, type: 'moneyMult', val: 25 }
];

const diagramShopItems = [
    { id: 'd1', name: 'Marketing Campaign', desc: '+10 fans instantly per purchase', baseCost: 100, costMult: 1.5, req: 0, type: 'fanInstant', val: 10 },
    { id: 'd2', name: 'Social Media Ads', desc: '+2 fans/sec per level', baseCost: 1000, costMult: 1.6, req: 0, type: 'fanPassive', val: 2 },
    { id: 'd3', name: 'Billboard Ads', desc: '+15 fans/sec per level', baseCost: 15000, costMult: 1.7, req: 0, type: 'fanPassive', val: 15 },
    { id: 'd4', name: 'TV Commercial', desc: '+100 fans/sec per level', baseCost: 200000, costMult: 1.8, req: 0, type: 'fanPassive', val: 100 },
    { id: 'd5', name: 'Influencer Partners', desc: '+600 fans/sec per level', baseCost: 1000000, costMult: 2.0, req: 1, type: 'fanPassive', val: 600 },
    { id: 'd6', name: 'Celebrity Endorsement', desc: '+4000 fans/sec per level', baseCost: 10000000, costMult: 2.1, req: 1, type: 'fanPassive', val: 4000 },
    { id: 'd7', name: 'Podcast Tour', desc: '+25000 fans/sec per level', baseCost: 100000000, costMult: 2.2, req: 1, type: 'fanPassive', val: 25000 },
    { id: 'd8', name: 'Streaming Deal', desc: '+150000 fans/sec per level', baseCost: 1000000000, costMult: 2.3, req: 1, type: 'fanPassive', val: 150000 },
    { id: 'd9', name: 'Viral Marketing', desc: 'x1.5 fan generation (stacks)', baseCost: 500000000, costMult: 2.5, req: 2, type: 'fanMult', val: 1.5 },
    { id: 'd10', name: 'Meme Army', desc: 'x2 fan generation (stacks)', baseCost: 2500000000, costMult: 2.6, req: 2, type: 'fanMult', val: 2 },
    { id: 'd11', name: 'Trending Worldwide', desc: 'x3 fan generation (stacks)', baseCost: 15000000000, costMult: 2.7, req: 2, type: 'fanMult', val: 3 },
    { id: 'd12', name: 'News Coverage', desc: 'x5 fan generation (stacks)', baseCost: 75000000000, costMult: 2.8, req: 2, type: 'fanMult', val: 5 },
    { id: 'd13', name: 'Global PR', desc: 'x10 fan generation (stacks)', baseCost: 500000000000, costMult: 3.0, req: 3, type: 'fanMult', val: 10 },
    { id: 'd14', name: 'Worldwide Campaign', desc: 'x25 fan generation (stacks)', baseCost: 2500000000000, costMult: 3.2, req: 3, type: 'fanMult', val: 25 },
    { id: 'd15', name: 'Cultural Phenomenon', desc: 'x50 fan generation (stacks)', baseCost: 15000000000000, costMult: 3.5, req: 3, type: 'fanMult', val: 50 },
    { id: 'd16', name: 'Internet Takeover', desc: 'x100 fan generation (stacks)', baseCost: 75000000000000, costMult: 4.0, req: 3, type: 'fanMult', val: 100 }
];

let currentPrice = 100;
let history = [];
const MAX_HISTORY = 40;
const canvas = document.getElementById('marketChart');
const ctx = canvas.getContext('2d');

const allAchievements = [
    { id: 'welcome', title: 'Welcome!', desc: 'Selected your first coin.' },
    { id: 'journey', title: 'Beginning of The Journey', desc: 'Launched your coin for the first time.' },
    { id: 'ohno', title: 'Oh No!', desc: 'Experienced your first market crash.' },
    { id: 'rebirth1', title: 'New Beginnings', desc: 'Complete your first Rebirth.' },
    { id: 'rebirth2', title: 'Reborn Again', desc: 'Complete your second Rebirth.' },
    { id: 'rebirth3', title: 'Veteran Trader', desc: 'Complete your third Rebirth.' },
    { id: 'rebirth4', title: 'Market Legend', desc: 'Complete your fourth Rebirth.' },
    { id: 'rebirth5', title: 'Cryptocurrency King', desc: 'Complete your fifth Rebirth.' },
    { id: 'hacker', title: 'Black Hat', desc: 'Hire the hacker for the first time.' }
];
let unlockedAchievements = [];

function formatNumber(num) {
    if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Qi';
    if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Q';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num);
}

function getRebirthCostMultiplier() {
    return Math.pow(1.4, rebirthLevel);
}

function getShopItemCost(item) {
    let level = shopLevels[item.id] || 0;
    return Math.floor(item.baseCost * Math.pow(item.costMult, level) * getRebirthCostMultiplier());
}

function calculateStats() {
    let clickAddSum = 0, clickMultProduct = 1;
    let moneyPassiveSum = 0, moneyMultProduct = 1;
    let fanPassiveSum = 0, fanMultProduct = 1;

    const allItems = [...clickerShopItems, ...diagramShopItems];
    allItems.forEach(item => {
        let lvl = shopLevels[item.id] || 0;
        if (lvl === 0) return;
        switch (item.type) {
            case 'clickAdd': clickAddSum += item.val * lvl; break;
            case 'clickMult': clickMultProduct *= Math.pow(item.val, lvl); break;
            case 'moneyPassive': moneyPassiveSum += item.val * lvl; break;
            case 'moneyMult': moneyMultProduct *= Math.pow(item.val, lvl); break;
            case 'fanPassive': fanPassiveSum += item.val * lvl; break;
            case 'fanMult': fanMultProduct *= Math.pow(item.val, lvl); break;
        }
    });

    let totalClickPower = (1 + clickAddSum) * clickMultProduct * rebirthMultiplier;
    let moneyFromFans = fans;
    let totalMoneyPerSec = (moneyFromFans + moneyPassiveSum) * moneyMultProduct * rebirthMultiplier;
    let totalFanPerSec = fanPassiveSum * fanMultProduct;

    return { totalClickPower, totalMoneyPerSec, totalFanPerSec };
}

function spawnCompetitor() {
    if (competitors.length >= MAX_COMPETITORS) return;
    const usedNames = competitors.map(c => c.name);
    const availableNames = COMPETITOR_NAMES.filter(n => !usedNames.includes(n));
    if (availableNames.length === 0) return;
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    const difficulty = getDifficultyData();
    const influence = 20 + Math.floor(Math.random() * 20);
    competitors.push({
        id: nextCompetitorId++,
        name: name,
        influence: influence,
        hitsRemaining: difficulty.competitorHits,
        isMega: false,
        money: 0,
        hackedSeconds: 0
    });
    renderCompetitors();
}

function updateCompetitors() {
    if (!isLaunched || rebirthLevel < 1) return;
    const difficulty = getDifficultyData();
    let stats = calculateStats();

    competitorSpawnTimer++;
    if (competitorSpawnTimer >= difficulty.competitorSpawnInterval) {
        competitorSpawnTimer = 0;
        spawnCompetitor();
    }

    competitors.forEach(c => {
        let corpIncome = c.influence * (stats.totalMoneyPerSec * 0.004);
        if (c.hackedSeconds > 0) {
            c.hackedSeconds--;
            money += corpIncome;
        } else {
            c.money += corpIncome;
        }
        c.influence = Math.min(100, c.influence + difficulty.competitorGrowth);
        if (c.influence >= 100) {
            let stolen = Math.floor(fans * 0.2);
            fans = Math.max(0, fans - stolen);
            c.influence = 50;
            showTopNotification(`${c.name} stole ${formatNumber(stolen)} fans!`, false);
        }
    });

    if (difficulty.megaCorpActive && competitors.length >= 3 && !competitors.some(c => c.isMega)) {
        const totalInfluence = competitors.reduce((s, c) => s + c.influence, 0) / 2 + 50;
        const totalMoney = competitors.reduce((s, c) => s + c.money, 0);
        competitors = [{
            id: nextCompetitorId++,
            name: competitors[0].name + " & Co.",
            influence: Math.min(200, totalInfluence),
            hitsRemaining: 3,
            isMega: true,
            money: totalMoney,
            hackedSeconds: 0
        }];
        showTopNotification("MEGA CORP FORMED!", false);
        document.getElementById('game-container').classList.add('fast-shake');
        setTimeout(() => document.getElementById('game-container').classList.remove('fast-shake'), 300);
        renderCompetitors();
    }
}

function getCompetitorDebuff() {
    if (competitors.length === 0) return 1;
    let total = competitors.reduce((sum, c) => sum + c.influence, 0);
    let floor = competitors.some(c => c.isMega) ? 0.05 : 0.2;
    return Math.max(floor, 1 - total / 100);
}

function getAttackCost() {
    let stats = calculateStats();
    return Math.floor(Math.max(100, stats.totalMoneyPerSec * 5));
}

function attackCompetitor(id) {
    const c = competitors.find(x => x.id === id);
    if (!c) return;
    const cost = getAttackCost();
    if (money < cost) {
        showTopNotification("Not enough money!", false);
        return;
    }
    money -= cost;
    c.hitsRemaining--;
    c.influence -= 8;

    if (c.hitsRemaining > 0 && c.influence > 0) {
        showTopNotification(`${c.name} is shielded! ${c.hitsRemaining} more hit${c.hitsRemaining > 1 ? 's' : ''} needed.`, false);
    } else if (c.influence <= 0) {
        const reward = cost * 20 + c.money;
        money += reward;
        competitors = competitors.filter(x => x.id !== id);
        showTopNotification(`${c.name} was defeated! +€${formatNumber(reward)}`, false);
    }
    updateUI();
    renderCompetitors();
}

function getHackerCost() {
    let stats = calculateStats();
    return Math.floor(Math.max(5000, stats.totalMoneyPerSec * 15));
}

function updateHacker() {
    const difficulty = getDifficultyData();
    if (!difficulty.hackerUnlocked || !isLaunched || competitors.length === 0) {
        hackerActive = false;
        return;
    }
    if (hackerActive) {
        hackerTimer--;
        if (hackerTimer <= 0) {
            hackerActive = false;
            hackerSpawnCooldown = 60 + Math.floor(Math.random() * 60);
            showTopNotification("The hacker has left the market.", false);
        }
    } else {
        hackerSpawnCooldown--;
        if (hackerSpawnCooldown <= 0) {
            if (Math.random() < 0.4) {
                hackerActive = true;
                hackerTimer = 30;
                showTopNotification("🕶️ A hacker is available! Check Competitors view.", false);
            } else {
                hackerSpawnCooldown = 20;
            }
        }
    }
}

function hackCompetitor(id) {
    if (!hackerActive) return;
    const c = competitors.find(x => x.id === id);
    if (!c) return;
    const cost = getHackerCost();
    if (money < cost) {
        showTopNotification("Not enough money to hire the hacker!", false);
        return;
    }
    money -= cost;
    money += c.money;
    const grabbedMoney = c.money;
    c.money = 0;
    c.hackedSeconds = 60;
    c.influence = Math.max(0, c.influence - 25);
    showTopNotification(`Hacked ${c.name}! Grabbed €${formatNumber(grabbedMoney)}. Draining for 60s.`, false);
    unlockAchievement('hacker', 'Black Hat', 'Hire the hacker for the first time.');
    hackerActive = false;
    hackerSpawnCooldown = 90 + Math.floor(Math.random() * 60);
    renderCompetitors();
    updateUI();
}

function renderCompetitors() {
    const container = document.getElementById('competitors-list');
    if (!container) return;
    let html = '';

    if (hackerActive) {
        const cost = getHackerCost();
        html += `
            <div class="hacker-card">
                <div class="hacker-header">🕶️ HACKER AVAILABLE</div>
                <div class="hacker-desc">Hire this hacker to drain a competitor — you'll get all their current money AND their earnings for 60 seconds.</div>
                <div class="hacker-timer">⏳ Leaves in ${hackerTimer}s</div>
                <div class="hacker-cost">Hire cost: €${formatNumber(cost)}</div>
                <div class="hacker-desc" style="color:#FFC107;">👇 Click "Hack Them" on any competitor below</div>
            </div>
        `;
    }

    if (competitors.length === 0) {
        html += `<div class="competitor-empty">No competitors yet. They will appear as your coin grows in power.</div>`;
        container.innerHTML = html;
        return;
    }

    const debuff = getCompetitorDebuff();
    const debuffPercent = Math.round((1 - debuff) * 100);
    html += `<div class="competitor-debuff">Income reduced by ${debuffPercent}%</div>`;

    competitors.forEach(c => {
        const cost = getAttackCost();
        const canAfford = money >= cost;
        const shieldInfo = c.hitsRemaining > 1 ? `<div class="competitor-shield">🛡️ Shielded — ${c.hitsRemaining} hits remaining</div>` : '';
        const hackedInfo = c.hackedSeconds > 0 ? `<div class="hacked-indicator">🕶️ BEING HACKED (${c.hackedSeconds}s)</div>` : '';
        const hackerCost = getHackerCost();
        const canHack = hackerActive && money >= hackerCost;

        html += `
            <div class="competitor-card ${c.isMega ? 'mega' : ''} ${c.hackedSeconds > 0 ? 'hacked' : ''}">
                <div class="competitor-name">${c.isMega ? '💀 ' : ''}${c.name}</div>
                ${shieldInfo}
                ${hackedInfo}
                <div class="competitor-money">💰 Corp Money: €${formatNumber(c.money)}</div>
                <div class="competitor-influence-bar">
                    <div class="competitor-influence-fill" style="width: ${Math.min(100, c.influence)}%"></div>
                </div>
                <div class="competitor-influence-text">${Math.round(c.influence)}% influence — at 100% they steal 20% of your fans</div>
                <button class="market-btn competitor-attack-btn" ${canAfford ? '' : 'disabled'} onclick="attackCompetitor(${c.id})">
                    Attack — €${formatNumber(cost)}
                </button>
                ${hackerActive ? `<button class="market-btn hack-btn" ${canHack ? '' : 'disabled'} onclick="hackCompetitor(${c.id})">🕶️ Hack Them — €${formatNumber(hackerCost)}</button>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

function playIntro() {
    const intro = document.getElementById('intro-screen');
    setTimeout(() => { intro.classList.add('visible'); }, 100);
    setTimeout(() => {
        intro.classList.remove('visible');
        setTimeout(() => {
            intro.style.display = 'none';
            document.getElementById('game-container').classList.add('visible');
            showCoinPopup();
        }, 2000);
    }, 3000);
}

function showCoinPopup() {
    const popup = document.getElementById('coin-popup');
    setTimeout(() => { popup.classList.add('visible'); }, 50);
}

function selectCoin(coinName) {
    selectedCoin = coinName;
    document.querySelector('.euro-btn').textContent = coinSymbols[coinName];
    unlockAchievement('welcome', 'Welcome!', 'Selected your first coin.');
    const popup = document.getElementById('coin-popup');
    popup.classList.remove('visible');
    setTimeout(() => {
        popup.style.display = 'none';
        startGameLoop();
    }, 500);
}

function showTopNotification(message, isCountdown = false) {
    const notif = document.getElementById('notification-container');
    const textSpan = document.getElementById('notification-text');
    const countSpan = document.getElementById('countdown');
    textSpan.innerText = message;
    if (topTimeout) clearTimeout(topTimeout);
    if (notificationInterval) clearInterval(notificationInterval);
    if (isCountdown) {
        countSpan.style.display = 'inline';
        let count = 4;
        countSpan.innerText = `(${count})`;
        notificationInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countSpan.innerText = `(${count})`;
            } else {
                clearInterval(notificationInterval);
                notif.classList.remove('show');
            }
        }, 1000);
    } else {
        countSpan.style.display = 'none';
        topTimeout = setTimeout(() => notif.classList.remove('show'), 3000);
    }
    notif.classList.add('show');
}

function showAchNotification(title, desc) {
    const notif = document.getElementById('ach-notification-container');
    const progressBar = document.getElementById('ach-progress');
    document.getElementById('ach-title-text').innerText = title;
    document.getElementById('ach-desc-text').innerText = desc;
    progressBar.classList.remove('active');
    void progressBar.offsetWidth;
    notif.classList.add('show');
    progressBar.classList.add('active');
    if (achTimeout) clearTimeout(achTimeout);
    achTimeout = setTimeout(() => {
        notif.classList.remove('show');
        progressBar.classList.remove('active');
    }, 7000);
}

function unlockAchievement(id, title, desc) {
    if (unlockedAchievements.includes(id)) return;
    unlockedAchievements.push(id);
    renderAchievements();
    showAchNotification(title, desc);
}

function renderAchievements() {
    const list = document.getElementById('achievements-list');
    list.innerHTML = '';
    allAchievements.forEach(ach => {
        const isUnlocked = unlockedAchievements.includes(ach.id);
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <div class="achievement-info"><h3>${ach.title}</h3><p>${ach.desc}</p></div>
            <div class="achievement-status">${isUnlocked ? 'Unlocked' : 'Locked'}</div>
        `;
        list.appendChild(item);
    });
}

function toggleAchievements() {
    const modal = document.getElementById('achievements-modal');
    if (modal.style.display === 'flex') {
        modal.classList.remove('visible');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    } else {
        renderAchievements();
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
    }
}

function toggleRebirth() {
    const modal = document.getElementById('rebirth-modal');
    if (modal.style.display === 'flex') {
        modal.classList.remove('visible');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    } else {
        updateRebirthModalUI();
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
    }
}

function updateRebirthModalUI() {
    document.getElementById('ui-multiplier-modal').innerText = rebirthMultiplier + 'x';
    const btnRebirth = document.getElementById('btn-rebirth-modal');
    const nextReq = rebirthReqs[rebirthLevel];
    if (rebirthLevel >= rebirthReqs.length) {
        btnRebirth.disabled = true;
        btnRebirth.innerText = "Max Rebirth Level Reached!";
        document.getElementById('ui-next-rebirth-modal').innerText = "MAX";
    } else {
        document.getElementById('ui-next-rebirth-modal').innerText = formatNumber(nextReq);
        if (fans >= nextReq) {
            btnRebirth.disabled = false;
            btnRebirth.innerText = "Rebirth Now!";
            btnRebirth.style.backgroundColor = "#4CAF50";
            btnRebirth.style.borderColor = "#81C784";
        } else {
            btnRebirth.disabled = true;
            btnRebirth.innerText = `Need ${formatNumber(nextReq)} Fans`;
            btnRebirth.style.backgroundColor = "#6a1b9a";
            btnRebirth.style.borderColor = "#8e24aa";
        }
    }
}

function switchView(direction) {
    currentView += direction;
    if (currentView < 0) currentView = 2;
    if (currentView > 2) currentView = 0;
    updateView();
}

function updateView() {
    document.getElementById('clicker-view').style.display = 'none';
    document.getElementById('chart-view').style.display = 'none';
    document.getElementById('competitors-view').style.display = 'none';
    document.getElementById('lock-overlay').style.display = 'none';
    document.getElementById('competitors-lock-overlay').style.display = 'none';

    if (currentView === 0) {
        document.getElementById('clicker-view').style.display = 'flex';
        document.getElementById('view-title').innerText = "Clicker";
    } else if (currentView === 1) {
        document.getElementById('chart-view').style.display = 'flex';
        document.getElementById('view-title').innerText = "Diagramm";
        if (!isLaunched) {
            document.getElementById('lock-overlay').style.display = 'flex';
            showTopNotification("Error: Launch Your Coin First.", true);
        }
    } else if (currentView === 2) {
        document.getElementById('competitors-view').style.display = 'flex';
        document.getElementById('view-title').innerText = "Competitors";
        if (rebirthLevel < 1) {
            document.getElementById('competitors-lock-overlay').style.display = 'flex';
            showTopNotification("Error: Rebirth to Unlock Competitors.", true);
        }
        renderCompetitors();
    }
    currentShopPage = 0;
    renderShop();
}

function changeShopPage(direction) {
    let maxPage = Math.min(rebirthLevel, TOTAL_PAGES - 1);
    currentShopPage += direction;
    if (currentShopPage < 0) currentShopPage = 0;
    if (currentShopPage > maxPage) currentShopPage = maxPage;
    renderShop();
}

function renderShop() {
    const shopContainer = document.getElementById('shop-items');
    const pagination = document.getElementById('shop-pagination');
    const pageDisplay = document.getElementById('page-display');
    const btnPrev = document.getElementById('btn-page-prev');
    const btnNext = document.getElementById('btn-page-next');

    if (!isLaunched || currentView === 2) {
        shopContainer.classList.add('hidden');
        pagination.classList.add('hidden');
        return;
    }
    shopContainer.classList.remove('hidden');
    pagination.classList.remove('hidden');

    let items = (currentView === 1) ? diagramShopItems : clickerShopItems;
    let maxPage = Math.min(rebirthLevel, TOTAL_PAGES - 1);
    if (currentShopPage > maxPage) currentShopPage = maxPage;

    pageDisplay.innerText = `${currentShopPage + 1} / ${TOTAL_PAGES}`;

    if (currentShopPage === 0) btnPrev.classList.add('disabled'); else btnPrev.classList.remove('disabled');
    if (currentShopPage === maxPage) btnNext.classList.add('disabled'); else btnNext.classList.remove('disabled');

    let startIndex = currentShopPage * 4;
    let endIndex = startIndex + 4;
    let pageItems = items.slice(startIndex, endIndex);

    shopContainer.innerHTML = '';
    pageItems.forEach(item => {
        const level = shopLevels[item.id] || 0;
        const cost = getShopItemCost(item);
        const btn = document.createElement('button');
        btn.className = 'market-btn shop-item-btn';
        btn.innerHTML = `
            <div class="shop-item-title">${item.name} (Lvl ${level})</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-cost">Cost: €${formatNumber(cost)}</div>
        `;
        btn.onclick = () => buyShopItem(item.id);
        if (money < cost) btn.disabled = true;
        shopContainer.appendChild(btn);
    });
}

function buyShopItem(itemId) {
    let item = [...clickerShopItems, ...diagramShopItems].find(i => i.id === itemId);
    if (!item) return;
    let cost = getShopItemCost(item);
    if (money >= cost) {
        money -= cost;
        shopLevels[itemId] = (shopLevels[itemId] || 0) + 1;
        if (item.type === 'fanInstant') fans += item.val * shopLevels[itemId];
        updateUI();
        renderShop();
    } else {
        showTopNotification("Not enough money!", false);
    }
}

function startGameLoop() {
    currentPrice = 100;
    history = [];
    for (let i = 0; i < MAX_HISTORY; i++) history.push({ price: currentPrice, up: true });
    drawChart();
    updateUI();

    gameInterval = setInterval(() => {
        const difficulty = getDifficultyData();

        if (boomPhaseActive) {
            boomPhaseTimer--;
            if (boomPhaseTimer <= 0) {
                boomPhaseActive = false;
                boomPhaseTimer = 0;
            }
        }

        if (difficulty.regulatorActive && isLaunched) {
            regulatorTimer++;
            if (regulatorTimer >= REGULATOR_INTERVAL) {
                regulatorTimer = 0;
                let seized = Math.floor(money * 0.25);
                if (seized > 0) {
                    money -= seized;
                    showTopNotification(`SEC Investigation! Seized €${formatNumber(seized)}`, false);
                }
            }
        }

        if (isLaunched) {
            let stats = calculateStats();
            let debuff = getCompetitorDebuff();
            let boomBonus = boomPhaseActive ? 2 : 1;

            money += stats.totalMoneyPerSec * debuff * boomBonus;

            let fanGain = stats.totalFanPerSec;
            let previousPrice = currentPrice;
            updateMarketPrice();
            let priceDiff = currentPrice - previousPrice;

            if (priceDiff > 0) {
                let fansFromMarket = Math.floor(priceDiff * 0.5);
                if (fansFromMarket < 1 && Math.random() < 0.4) fansFromMarket = 1;
                fanGain += fansFromMarket;
            } else if (priceDiff < 0) {
                fanGain -= Math.floor(Math.abs(priceDiff) * 0.8);
            }
            fans = Math.max(0, fans + fanGain);

            updateCompetitors();
            updateHacker();

            if (Math.random() < difficulty.crashChance) {
                currentPrice *= (1 - difficulty.crashSeverity);
                fans = Math.floor(fans * 0.6);
                const gc = document.getElementById('game-container');
                gc.classList.add('fast-shake');
                setTimeout(() => gc.classList.remove('fast-shake'), 300);
                showTopNotification("Uh-oh, It Crashed!", false);
                if (!hasCrashed) {
                    hasCrashed = true;
                    unlockAchievement('ohno', 'Oh No!', 'Experienced your first market crash.');
                }
            }
        }
        if (currentView === 1) drawChart();
        if (currentView === 2) renderCompetitors();
        checkRebirthReady();
        updateUI();
        renderShop();
    }, 1000);
}

function checkRebirthReady() {
    if (rebirthLevel >= rebirthReqs.length) return;
    if (fans >= rebirthReqs[rebirthLevel] && lastRebirthNotified < rebirthLevel) {
        lastRebirthNotified = rebirthLevel;
        showTopNotification("Rebirth available! Check the Rebirth menu.", false);
    }
}

function clickEuro() {
    let stats = calculateStats();
    let debuff = getCompetitorDebuff();
    let boomBonus = boomPhaseActive ? 2 : 1;
    money += stats.totalClickPower * debuff * boomBonus;
    updateUI();
}

function launchCoin() {
    if (money >= 100 && !isLaunched) {
        isLaunched = true;
        document.getElementById('ui-users-container').classList.remove('hidden');
        document.getElementById('btn-launch').classList.add('hidden');
        if (currentView === 1) document.getElementById('lock-overlay').style.display = 'none';
        unlockAchievement('journey', 'Beginning of The Journey', 'Launched your coin for the first time.');
        showTopNotification("Coin Launched! Market is now open.", false);
        renderShop();
    }
}

function doRebirth() {
    if (rebirthLevel >= rebirthReqs.length) return;
    if (fans >= rebirthReqs[rebirthLevel]) {
        rebirthLevel++;
        rebirthMultiplier = Math.pow(2, rebirthLevel);

        money = 0;
        fans = 0;
        currentShopPage = 0;
        shopLevels = {};
        competitorSpawnTimer = 0;
        regulatorTimer = 0;
        competitors = [];
        hackerActive = false;
        hackerSpawnCooldown = 30;

        boomPhaseActive = true;
        boomPhaseTimer = BOOM_PHASE_DURATION;

        showTopNotification(`REBIRTH! Multiplier now ${rebirthMultiplier}x. BOOM PHASE!`, false);

        const achTitles = ['New Beginnings', 'Reborn Again', 'Veteran Trader', 'Market Legend', 'Cryptocurrency King'];
        const achDescs = ['Complete your first Rebirth.', 'Complete your second Rebirth.', 'Complete your third Rebirth.', 'Complete your fourth Rebirth.', 'Complete your fifth Rebirth.'];
        if (rebirthLevel <= 5) unlockAchievement('rebirth' + rebirthLevel, achTitles[rebirthLevel - 1], achDescs[rebirthLevel - 1]);

        const mechanics = [
            null,
            { name: 'Competition', desc: 'Competitors now enter the market. They reduce your income until defeated.' },
            { name: 'Volatility', desc: 'Market crashes hit harder and more often. Also: the HACKER becomes available — check the Competitors view!' },
            { name: 'Hostile', desc: 'Competitors are now shielded — 2 attacks needed to defeat them.' },
            { name: 'Regulation', desc: 'The SEC will randomly seize 25% of your money every 60 seconds.' },
            { name: 'Cutthroat', desc: 'Competitors can merge into MEGA CORPS with 200% influence.' }
        ];
        const mech = mechanics[rebirthLevel];
        if (mech) setTimeout(() => showAchNotification(`New Challenge: ${mech.name}`, mech.desc), 2000);

        if (rebirthLevel === 1) setTimeout(() => spawnCompetitor(), 3000);

        updateUI();
        renderShop();
        drawChart();
        toggleRebirth();
    }
}

function updateUI() {
    document.getElementById('ui-money').innerText = formatNumber(money);
    document.getElementById('ui-users').innerText = formatNumber(fans);

    let stats = calculateStats();
    let debuff = getCompetitorDebuff();
    let boomBonus = boomPhaseActive ? 2 : 1;
    document.getElementById('ui-income').innerText = formatNumber(stats.totalMoneyPerSec * debuff * boomBonus);

    const btnLaunch = document.getElementById('btn-launch');
    if (!isLaunched && money >= 100) {
        btnLaunch.disabled = false;
        btnLaunch.innerText = "Launch Coin (€100)";
    } else if (!isLaunched) {
        btnLaunch.innerText = `Launch Coin (Need €${formatNumber(100 - money)})`;
    }

    const badge = document.getElementById('rebirth-badge');
    if (rebirthLevel < rebirthReqs.length && fans >= rebirthReqs[rebirthLevel]) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    if (document.getElementById('rebirth-modal').style.display === 'flex') updateRebirthModalUI();
}

function updateMarketPrice() {
    let changePercent = (Math.random() - 0.48) * 0.1;
    let previousPrice = currentPrice;
    currentPrice += currentPrice * changePercent;
    if (currentPrice < 1) currentPrice = 1;
    history.push({ price: currentPrice, up: currentPrice >= previousPrice });
    if (history.length > MAX_HISTORY) history.shift();
}

function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let minPrice = Math.min(...history.map(h => h.price));
    let maxPrice = Math.max(...history.map(h => h.price));
    let padding = (maxPrice - minPrice) * 0.1 || 10;
    minPrice -= padding;
    maxPrice += padding;
    let range = maxPrice - minPrice;
    if (range === 0) range = 1;
    let barWidth = canvas.width / MAX_HISTORY;

    let currentY = canvas.height - ((currentPrice - minPrice) / range) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(canvas.width, currentY);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();

    history.forEach((point, index) => {
        let x = index * barWidth;
        let barHeight = ((point.price - minPrice) / range) * canvas.height;
        let y = canvas.height - barHeight;
        ctx.fillStyle = point.up ? '#28a745' : '#dc3545';
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
    });
}

window.onload = playIntro;
