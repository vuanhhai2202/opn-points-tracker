import { ethers } from "ethers";
import "./style.css";

const CONTRACT_ADDRESS = "0x45C277439298AAF0952bC92236C78Aa138313a51";
const OPN_TOKEN_ADDRESS = "0xE76ac2dA2E36c9D1261759a2145a1c39d90712E4";
const OPN_VAULT_ADDRESS = "0xbed81f0BDd64EFce45AD77b42B6c8b52371991d5";
const CHAIN_ID = "0x3d8";

const ABI = [
  "function dailyCheckIn(uint256 amount)",
  "function getPoints(address user) view returns(uint256)",
  "function canCheckIn(address user) view returns(bool)",

  "function completeQuest(uint256 questId, uint256 reward)",
  "function hasCompletedQuest(address user, uint256 questId) view returns(bool)",
  "function claimNFT(uint256 tier)",
  "function hasClaimedNFT(address user, uint256 tier) view returns(bool)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function lastCheckInDay(address user) view returns (uint256)",
  "function canClaimFaucet(address user) view returns(bool)"
];
const OPN_TOKEN_ABI = [
  "function claimTestOPN()",
  "function balanceOf(address user) view returns(uint256)",
  "function approve(address spender, uint256 amount)",
  "function decimals() view returns(uint8)",
  "function canClaimFaucet(address user) view returns(bool)"
];

const OPN_VAULT_ABI = [
  "function stake(uint256 amount)",
  "function withdraw()",
  "function claimReward()",
  "function stakedAmount(address user) view returns(uint256)",
  "function pendingReward(address user) view returns(uint256)"
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
        <p><span>Next Check-In</span><b id="countdown">Loading...</b></p>
        <p><span>Contract</span><b class="mono">${CONTRACT_ADDRESS}</b></p>
      </div>

      <button id="checkInBtn">Daily Check-In</button>

      <p id="status"></p>

    </div>
     <div class="card nft-card-main">
      <h2>NFT Reward Center</h2>
      <div id="nftRewards"></div>
    </div>

    <div class="card quest-card-main">

      <div class="card faucet-card">
        <h2>OQH Faucet</h2>
        <p class="subtitle">
          Claim free test OQH tokens for staking.
        </p>
        <p id="faucetStatus">Loading...</p>
      <button id="faucetBtn" onclick="claimTestOPN()">
        Claim 1000 OQH
      </button>
      </div>

      <h2>OQH DeFi Vault</h2>

      <div class="info">
        <p><span>OQH Balance</span><b id="opnBalance">0</b></p>
        <p><span>Staked OQH</span><b id="stakedOPN">0</b></p>
        <p><span>Pending Reward</span><b id="pendingReward">0</b></p>
      </div>

      <div class="stake-input-wrapper">
        <input
          id="stakeAmount"
          class="stake-input"
          type="number"
          placeholder="Enter OQH amount"
        />

        <button
          type="button"
          class="max-btn"
          onclick="setMaxStake()"
        >
          MAX
        </button>
      </div>

      <button onclick="stakeOPN()">
        Stake OQH
      </button>

      <button onclick="claimVaultReward()">
        Claim Reward
      </button>

      <button onclick="withdrawOPN()">
        Withdraw
      </button>
    </div>

    <div class="card quest-card-main">
      <h2>Quest System</h2>
      <div id="quests"></div>
    </div>


    <div class="card quest-card-main">
    <h2>On-chain Activity</h2>
    <div id="onchainQuests"></div>
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
const openedQuests = {};
let signer;
let contract;
let userAddress;
let countdownTimer;
let opnToken;
let opnVault;

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

async function startCountdown() {
  clearInterval(countdownTimer);

  if (!userAddress || !contract) {
    countdownText.innerText = "Connect Wallet";
    return;
  }

  let canCheck = false;

  try {
    canCheck = await contract.canCheckIn(userAddress);
  } catch (err) {
    console.error("canCheckIn error:", err);
  }

  if (canCheck) {
    countdownText.innerText = "Available Now";
    checkInBtn.disabled = false;
    checkInBtn.innerText = "Daily Check-In";
    return;
  }

  function updateCountdown() {
    const now = new Date();
    const nextUTC = new Date(now);

    nextUTC.setUTCHours(24, 0, 0, 0);

    const remaining = nextUTC.getTime() - now.getTime();

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
  }

  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
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
    opnToken = new ethers.Contract(
        OPN_TOKEN_ADDRESS,
        OPN_TOKEN_ABI,
        signer
      );

      opnVault = new ethers.Contract(
        OPN_VAULT_ADDRESS,
        OPN_VAULT_ABI,
        signer
      );
    walletText.innerText =
      userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

    await updateCheckInButton();
    await refreshPoints();
    await renderQuests();
    await renderOnchainQuests();
    await renderNFTRewards();
    await startCountdown();
    await renderDeFiVault();
    await updateFaucetStatus();

    connectBtn.innerText = "Connected";
    connectBtn.disabled = true;

    updateCheckInButton();

    statusText.innerText = "Wallet connected successfully.";
  } catch (error) {
  console.error("CONNECT ERROR:", error);
  statusText.innerText = error.message || "Connection failed.";
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
    await renderNFTRewards();

    updateCheckInButton();

    statusText.innerText =
      `Check-in successful! You earned +${reward} points.`;
  } catch (error) {
    console.error(error);
    statusText.innerText = "Check-in failed or rejected.";
    updateCheckInButton();
  }
  await refreshPoints();
  await updateCheckInButton();
  await startCountdown();
};
const quests = [
  { id: 1, title: "Follow IOPN", reward: 50, url: "https://x.com/IOPn_io" },
  { id: 2, title: "Join Discord", reward: 50, url: "https://discord.com/invite/iopn" },
  { id: 3, title: "Share Project", reward: 100, url: "https://opn-points-tracker.vercel.app" },
  { id: 4, title: "Submit Feedback", reward: 150, url: "https://github.com/vuanhhai2202/opn-points-tracker/issues" },
];
const ONCHAIN_QUESTS = [
  { id: 101, tx: 1, reward: 1, title: "1 Transaction" },
  { id: 102, tx: 10, reward: 5, title: "10 Transactions" },
  { id: 103, tx: 50, reward: 15, title: "50 Transactions" },
  { id: 104, tx: 100, reward: 30, title: "100 Transactions" },
  { id: 105, tx: 500, reward: 75, title: "500 Transactions" },
  { id: 106, tx: 1000, reward: 150, title: "1000 Transactions" },
  { id: 107, tx: 2000, reward: 300, title: "2000 Transactions" }
];
async function renderQuests() {
  const questBox = document.getElementById("quests");
  if (!questBox || !contract || !userAddress) return;

  questBox.innerHTML = "";

  for (const quest of quests) {
    const done = await contract.hasCompletedQuest(userAddress, quest.id);

    const div = document.createElement("div");
    div.className = "quest-card";

    div.innerHTML = `
      <h3>${quest.title}</h3>
      <p>Reward: +${quest.reward} points</p>

      <button onclick="doQuest(${quest.id}, '${quest.url}')">
        Do Quest
      </button>

      <button id="completeQuestBtn${quest.id}" ${done ? "disabled" : "disabled"} onclick="completeQuest(${quest.id}, ${quest.reward})">
        ${done ? "Completed" : "Complete Quest"}
      </button>
    `;

    questBox.appendChild(div);
  }
}
window.doQuest = function (questId, url) {
  openedQuests[questId] = true;
  window.open(url, "_blank");

  const btn = document.getElementById(`completeQuestBtn${questId}`);
  if (btn) {
    btn.disabled = false;
  }
};
async function renderOnchainQuests() {
  const box = document.getElementById("onchainQuests");
  if (!box) return;

  box.innerHTML = "";

  if (!contract || !userAddress) {
    box.innerHTML = `<p>Please connect wallet.</p>`;
    return;
  }

  const walletProvider = getWalletProvider();
  const provider = new ethers.BrowserProvider(walletProvider);
  const txCount = await provider.getTransactionCount(userAddress);

  for (const q of ONCHAIN_QUESTS) {
    const completed = await contract.hasCompletedQuest(userAddress, q.id);
    const eligible = txCount >= q.tx;

    const div = document.createElement("div");
    div.className = "quest-item";

    div.innerHTML = `
      <div class="onchain-card">
        <h3>${q.title}</h3>
        <p>Reward: +${q.reward} points</p>

        <button ${completed || !eligible ? "disabled" : ""}>
          ${completed ? "Claimed" : eligible ? "Claim Points" : "Locked"}
        </button>
      </div>
    `;

    const btn = div.querySelector("button");

    btn.onclick = async () => {
      try {
        statusText.innerText = "Claiming on-chain activity reward...";

        const tx = await contract.completeQuest(q.id, q.reward);
        await tx.wait();

        statusText.innerText = `Claimed +${q.reward} points!`;

        await refreshPoints();
        await renderOnchainQuests();
        await renderNFTRewards();
      } catch (err) {
        console.error(err);
        statusText.innerText = "Claim failed or rejected.";
      }
    };

    box.appendChild(div);
  }
}

window.completeQuest = async function (questId, reward) {
  if (!openedQuests[questId]) {
  statusText.innerText = "Please click Do Quest first.";
  return;
}
  try {
    const tx = await contract.completeQuest(questId, reward);
    await tx.wait();

    await refreshPoints();
    await renderQuests();
    await renderNFTRewards();

    statusText.innerText = "Quest completed!";
  } catch (err) {
    console.error(err);
    statusText.innerText = "Quest failed or already completed.";
  }
};

const nftRewards = [
  { tier: 1, title: "Bronze NFT", required: 100 },
  { tier: 2, title: "Silver NFT", required: 500 },
  { tier: 3, title: "Gold NFT", required: 1000 },
];

async function renderNFTRewards() {
  const box = document.getElementById("nftRewards");
  if (!box || !contract || !userAddress) return;

  box.innerHTML = "";

  const points = Number(await contract.getPoints(userAddress));
  const imageMap = {
    1: "/bronze.png",
    2: "/silver.png",
    3: "/gold.png",
  };
  for (const nft of nftRewards) {
    const claimed = await contract.hasClaimedNFT(userAddress, nft.tier);
    const eligible = points >= nft.required;

    const div = document.createElement("div");
    div.className = "quest-card";
  let buttonText = "";
  let buttonDisabled = "";

  if (claimed) {
    buttonText = "Claimed";
    buttonDisabled = "disabled";
  } else if (!eligible) {
    buttonText = "Not enough points";
    buttonDisabled = "disabled";
  } else {
    buttonText = "Claim NFT";
  }
  div.innerHTML = `
    <div class="nft-row">
      <div>
        <h3>${nft.title}</h3>
        <p>Required: ${nft.required} points</p>
      </div>

      <img
        class="nft-thumb"
        src="${imageMap[nft.tier]}"
        alt="${nft.title}"
      />
    </div>

    <button>${buttonText}</button>
  `;

    box.appendChild(div);
  }
}

window.claimNFT = async function (tier) {
  try {
    statusText.innerText = "Claiming NFT... Waiting for wallet signature.";

    const tx = await contract.claimNFT(tier);
    await tx.wait();

    await renderNFTRewards();

    statusText.innerText = "NFT claimed successfully!";
  } catch (err) {
    console.error(err);
    statusText.innerText = "NFT claim failed or rejected.";
  }
  const ONCHAIN_QUESTS = [
  { id: 101, tx: 1, reward: 1, title: "Make 1 On-chain Transaction" },
  { id: 102, tx: 10, reward: 5, title: "Make 10 On-chain Transactions" },
  { id: 103, tx: 50, reward: 15, title: "Make 50 On-chain Transactions" },
  { id: 104, tx: 100, reward: 30, title: "Make 100 On-chain Transactions" },
  { id: 105, tx: 500, reward: 75, title: "Make 500 On-chain Transactions" },
  { id: 106, tx: 1000, reward: 150, title: "Make 1000 On-chain Transactions" },
  { id: 107, tx: 2000, reward: 300, title: "Make 2000 On-chain Transactions" }
];
async function getUserTxCount() {
  const walletProvider = getWalletProvider();
  const provider = new ethers.BrowserProvider(walletProvider);

  return await provider.getTransactionCount(userAddress);
}
const OPN_TOKEN_ADDRESS = "0xeF9373765aAd5dbC752cdc4CD3f1E07844899d7B";
const OPN_VAULT_ADDRESS = "0x729114c8F0432E5F5d972CFb44637A45A74b5D9A";

};
async function getDeFiContracts() {
  const walletProvider = getWalletProvider();
  const provider = new ethers.BrowserProvider(walletProvider);
  const signer = await provider.getSigner();

  const opnToken = new ethers.Contract(
    OPN_TOKEN_ADDRESS,
    OPN_TOKEN_ABI,
    signer
  );

  const opnVault = new ethers.Contract(
    OPN_VAULT_ADDRESS,
    OPN_VAULT_ABI,
    signer
  );

  return { opnToken, opnVault };
}

async function renderDeFiVault() {
  if (!userAddress) return;

  const { opnToken, opnVault } = await getDeFiContracts();

  const balance = await opnToken.balanceOf(userAddress);
  const staked = await opnVault.stakedAmount(userAddress);
  const reward = await opnVault.pendingReward(userAddress);

  document.getElementById("opnBalance").innerText = ethers.formatEther(balance);
  document.getElementById("stakedOPN").innerText = ethers.formatEther(staked);
  document.getElementById("pendingReward").innerText = ethers.formatEther(reward);
}

async function updateFaucetStatus() {
  const canClaim =
    await opnToken.canClaimFaucet(userAddress);

  const faucetBtn =
    document.getElementById("faucetBtn");

  const faucetStatus =
    document.getElementById("faucetStatus");

  if (canClaim) {
    faucetBtn.disabled = false;
    faucetStatus.innerText = "Available Now";
  } else {
    faucetBtn.disabled = true;
    faucetStatus.innerText = "Already claimed today";
  }
}

window.claimTestOPN = async function () {
  try {
    statusText.innerText = "Claiming 1000 OQH...";

    const tx = await opnToken.claimTestOPN();
    await tx.wait();

    statusText.innerText = "Claimed 1000 OQH successfully!";

    try {
      await renderDeFiVault();
      await updateFaucetStatus();
    } catch (uiErr) {
      console.error("UI refresh error:", uiErr);
    }
  } catch (err) {
    console.error(err);
    statusText.innerText =
      err.reason || "Faucet already claimed today.";
  }
};

window.stakeOPN = async function () {
  try {
    statusText.innerText = "Approving OPN...";

    const { opnToken, opnVault } = await getDeFiContracts();
    const input = document.getElementById("stakeAmount").value;

    if (!input || Number(input) <= 0) {
      alert("Enter amount");
      return;
    }

    const amount = ethers.parseEther(input);

    const approveTx = await opnToken.approve(OPN_VAULT_ADDRESS, amount);
    await approveTx.wait();

    statusText.innerText = "Staking 100 OPN...";

    const stakeTx = await opnVault.stake(amount);
    await stakeTx.wait();

    await renderDeFiVault();

    statusText.innerText = "Staked 100 OPN successfully!";
  } catch (err) {
    console.error(err);
    statusText.innerText = "Stake failed.";
  }
};

window.claimVaultReward = async function () {
  try {
    statusText.innerText = "Claiming vault reward...";

    const { opnVault } = await getDeFiContracts();
    const tx = await opnVault.claimReward();
    await tx.wait();

    await renderDeFiVault();

    statusText.innerText = "Vault reward claimed!";
  } catch (err) {
    console.error(err);
    statusText.innerText = "Claim reward failed.";
  }
};

window.withdrawOPN = async function () {
  try {
    statusText.innerText = "Withdrawing OPN...";

    const { opnVault } = await getDeFiContracts();
    const tx = await opnVault.withdraw();
    await tx.wait();

    await renderDeFiVault();

    statusText.innerText = "Withdraw successful!";
  } catch (err) {
    console.error(err);
    statusText.innerText = "Withdraw failed.";
  }
};
window.setMaxStake = async function () {
  const balance = document.getElementById("opnBalance").innerText;
  document.getElementById("stakeAmount").value = parseFloat(balance);
};