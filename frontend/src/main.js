import { ethers } from "ethers";
import "./style.css";

const CONTRACT_ADDRESS = "0x08eB5dD0323F52699E42d5239b532048afBb9A58";
const CHAIN_ID = "0x3d8";

const ABI = [
  "function dailyCheckIn(uint256 amount)",
  "function getPoints(address user) view returns(uint256)",
  "function canCheckIn(address user) view returns(bool)",

  "function completeQuest(uint256 questId, uint256 reward)",
  "function hasCompletedQuest(address user, uint256 questId) view returns(bool)"
];

document.querySelector("#app").innerHTML = `
  <main class="container">
  <div class="dashboard">
    <div class="card checkin-card">
      <p class="badge">IOPN Testnet • Chain ID 984</p>
      <h1>OPN Points Tracker</h1>
      <p class="subtitle">Daily check-in and earn on-chain OPN points.</p>

      <button id="connectBtn">Connect OKX or MetaMask Wallet</button>

      <div class="info">
        <p><span>Wallet</span><b id="wallet">Not Connected</b></p>
        <p><span>Points</span><b id="points">0</b></p>
        <p><span>Badge</span><b id="userBadge">No Badge</b></p>
        <p><span>Next Check-In</span><b id="countdown">Connect Wallet</b></p>
        <p><span>Contract</span><b class="mono">${CONTRACT_ADDRESS}</b></p>
      </div>

      <button id="checkInBtn">Daily Check-In</button>

      <p id="status"></p>

    </div>

    <div class="card quest-card-main">
      <h2>Quest System</h2>
      <div id="quests"></div>
    </div>
  </main>
`;

const connectBtn = document.getElementById("connectBtn");
const checkInBtn = document.getElementById("checkInBtn");
const walletText = document.getElementById("wallet");
const pointsText = document.getElementById("points");
const userBadge = document.getElementById("userBadge");
const countdownText = document.getElementById("countdown");
const statusText = document.getElementById("status");

let signer;
let contract;
let userAddress;
let countdownTimer;

function randomPoints() {
  const rewards = [10, 20, 30, 40, 50];
  return rewards[Math.floor(Math.random() * rewards.length)];
}

function getBadge(points) {
  if (points >= 1000) return "🥇 Gold Member";
  if (points >= 500) return "🥈 Silver Member";
  if (points >= 100) return "🥉 Bronze Member";
  return "New Explorer";
}

function getUTCDateKey() {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCheckInKey() {
  const wallet = userAddress.toLowerCase();
  return `opn_daily_checkin_${wallet}_${getUTCDateKey()}`;
}

function saveTodayCheckIn() {
  localStorage.setItem(getCheckInKey(), "checked");
}


function hasCheckedInToday() {
  if (!userAddress) return false;
  return localStorage.getItem(getCheckInKey()) === "checked";
}

function getNextUTCMidnight() {
  const now = new Date();

  const nextUtcMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0
    )
  );

  return nextUtcMidnight;
}

function formatTime(ms) {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function startCountdown() {
  clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    if (!userAddress) {
      countdownText.innerText = "Connect Wallet";
      return;
    }

    if (!hasCheckedInToday()) {
      countdownText.innerText = "Available Now";
      checkInBtn.disabled = false;
      checkInBtn.innerText = "Daily Check-In";
      return;
    }

    const nextTime = getNextUTCMidnight();
    const remaining = nextTime.getTime() - Date.now();

    if (remaining <= 0) {
      countdownText.innerText = "Available Now";
      checkInBtn.disabled = false;
      checkInBtn.innerText = "Daily Check-In";
      clearInterval(countdownTimer);
      return;
    }

    countdownText.innerText = formatTime(remaining);
    checkInBtn.disabled = true;
    checkInBtn.innerText = "Already Checked-In Today";
  }, 1000);
}

async function updateCheckInButton() {
  if (!contract || !userAddress) return;

  try {
    const canCheck =
      await contract.canCheckIn(userAddress);

    if (canCheck) {
      checkInBtn.disabled = false;
      checkInBtn.innerText = "Daily Check-In";
    } else {
      checkInBtn.disabled = true;
      checkInBtn.innerText = "Already Checked-In Today";
    }
  } catch (err) {
    console.log(err);
  }
}

function getWalletProvider() {
  if (window.okxwallet) return window.okxwallet;

  if (window.ethereum && window.ethereum.providers) {
    const okx = window.ethereum.providers.find(
      (p) => p.isOkxWallet || p.isOKExWallet
    );
    if (okx) return okx;

    const metamask = window.ethereum.providers.find((p) => p.isMetaMask);
    if (metamask) return metamask;
  }

  if (window.ethereum) return window.ethereum;

  return null;
}

async function switchToIOPN(walletProvider) {
  await walletProvider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: CHAIN_ID }]
  });
}

async function refreshPoints() {
  const points = await contract.getPoints(userAddress);
  const pointNumber = Number(points);

  pointsText.innerText = pointNumber.toString();
  userBadge.innerText = getBadge(pointNumber);
}

connectBtn.onclick = async () => {
  try {
    const walletProvider = getWalletProvider();

    if (!walletProvider) {
      alert("Please install OKX Wallet or MetaMask.");
      return;
    }

    statusText.innerText = "Connecting wallet...";

    await switchToIOPN(walletProvider);

    const provider = new ethers.BrowserProvider(walletProvider);
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    walletText.innerText =
      userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

    await updateCheckInButton();
    await refreshPoints();
    await renderQuests();
   

    connectBtn.innerText = "Connected";
    connectBtn.disabled = true;

    updateCheckInButton();

    statusText.innerText = "Wallet connected successfully.";
  } catch (error) {
    console.error(error);
    statusText.innerText = "Connection failed. Please check wallet/network.";
  }
};

checkInBtn.onclick = async () => {
  try {
    if (!contract || !userAddress) {
      alert("Connect wallet first.");
      return;
    }

    if (hasCheckedInToday()) {
      statusText.innerText = "You have already checked in today.";
      updateCheckInButton();
      return;
    }

    const reward = randomPoints();

    checkInBtn.disabled = true;
    checkInBtn.innerText = "Checking in...";

    statusText.innerText =
      `Daily reward: +${reward} points. Waiting for wallet signature...`;

    const canCheck = await contract.canCheckIn(userAddress);

    if (!canCheck) {
    statusText.innerText =
    "Already checked in today (verified on-chain).";

    updateCheckInButton();
     return;
    }

    const tx = await contract.dailyCheckIn(reward);

    statusText.innerText =
      "Transaction sent: " + tx.hash.slice(0, 18) + "...";

    await tx.wait();

    saveTodayCheckIn();

    await refreshPoints();

    updateCheckInButton();

    statusText.innerText =
      `Check-in successful! You earned +${reward} points.`;
  } catch (error) {
    console.error(error);
    statusText.innerText = "Check-in failed or rejected.";
    updateCheckInButton();
  }
};
const quests = [
  { id: 1, title: "Follow IOPN", reward: 50, url: "https://x.com/IOPn_io" },
  { id: 2, title: "Join Discord", reward: 50, url: "https://discord.com/invite/iopn" },
  { id: 3, title: "Share Project", reward: 100, url: "https://opn-points-tracker.vercel.app" },
  { id: 4, title: "Submit Feedback", reward: 150, url: "https://github.com/vuanhhai2202/opn-points-tracker/issues" },
];
async function renderQuests() {
  const questBox = document.getElementById("quests");
  questBox.innerHTML = "";

  for (const quest of quests) {
    const done = await contract.hasCompletedQuest(userAddress, quest.id);

    const div = document.createElement("div");
    div.className = "quest-card";

    div.innerHTML = `
     <h3>${quest.title}</h3>
     <p>Reward: +${quest.reward} points</p>

    <button onclick="window.open('${quest.url}', '_blank')">
    Do Quest
     </button>

     <button ${done ? "disabled" : ""} onclick="completeQuest(${quest.id}, ${quest.reward})">
    ${done ? "Completed" : "Complete Quest"}
    </button>
  `;

    questBox.appendChild(div);
  }
}
window.completeQuest = async function (questId, reward) {
  try {
    const tx = await contract.completeQuest(questId, reward);
    await tx.wait();

    await refreshPoints();
    await renderQuests();

    alert("Quest completed!");
  } catch (err) {
    console.error(err);
    alert("Quest failed or already completed.");
  }
};