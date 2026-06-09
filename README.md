# OPN Quest Hub

A Web3 gamified quest platform built on IOPN Testnet.

Users can complete quests, earn on-chain points, unlock badges, claim NFTs, and participate in ecosystem activities.

---

## Live Demo

Frontend:

https://opn-points-tracker.vercel.app

GitHub:

https://github.com/vuanhhai2202/opn-points-tracker

---

## Network

* Network: IOPN Testnet
* Chain ID: 984

Contract Address:

```text
0x45C277439298AAF0952bC92236C78Aa138313a51
```

---

## Features

### Wallet Integration

* Connect MetaMask
* Connect OKX Wallet
* Automatic network switch to IOPN Testnet

---

### On-Chain Points System

All user points are stored on-chain.

Functions:

```solidity
getPoints(address)
```

Features:

* Real-time point tracking
* Transparent and verifiable rewards
* Fully decentralized point storage

---

### Daily Check-In

Users can check in once every 24 hours.

Random rewards:

* 10 Points
* 20 Points
* 30 Points
* 40 Points
* 50 Points

Contract Function:

```solidity
canCheckIn(address)
```

---

### Quest System

Available Quests:

* Follow IOPN
* Join Discord
* Share Project
* Submit Feedback

Rewards:

| Quest           | Reward |
| --------------- | ------ |
| Follow IOPN     | +20    |
| Join Discord    | +30    |
| Share Project   | +100   |
| Submit Feedback | +150   |

Features:

* Complete once only
* On-chain verification
* Reward distribution via smart contract

Functions:

```solidity
completeQuest()
hasCompletedQuest()
```

---

### Badge System

Bronze Badge

* 100+ Points

Silver Badge

* 500+ Points

Gold Badge

* 1000+ Points

---

### NFT Reward Center

Users can claim achievement NFTs.

NFT Tiers:

| Tier       | Requirement |
| ---------- | ----------- |
| Bronze NFT | 100 Points  |
| Silver NFT | 500 Points  |
| Gold NFT   | 1000 Points |

Functions:

```solidity
claimNFT()
hasClaimedNFT()
tokenURI()
```

---

### NFT Metadata

IPFS Metadata CID:

```text
bafybeievscabqzzk7cyu5r7djjfyn3465jjhvd6hf7fqhc275womva7lpi
```

Files:

* bronze.json
* silver.json
* gold.json

---

### On-Chain Activity Rewards

Transaction milestone rewards:

| Transactions | Reward |
| ------------ | ------ |
| 1            | +1     |
| 10           | +5     |
| 50           | +15    |
| 100          | +30    |
| 500          | +75    |
| 1000         | +150   |
| 2000         | +300   |

Frontend reads activity using:

```javascript
provider.getTransactionCount(userAddress)
```

Quest IDs:

* 101
* 102
* 103
* 104
* 105
* 106
* 107

---

## Technology Stack

* Solidity
* Hardhat
* Ethers.js
* Vite
* HTML
* CSS
* JavaScript
* IPFS
* Vercel

---

## Project Structure

```text
frontend/
contracts/
scripts/
artifacts/
```

---

## Future Improvements

* Leaderboard
* Advanced Analytics
* Admin Dashboard
* Better Countdown System
* More Community Quests

---

## Why OPN Quest Hub?

OPN Quest Hub encourages ecosystem participation through:

* On-chain engagement
* Gamification
* NFT achievements
* Transparent reward mechanisms

This project demonstrates how blockchain can create engaging community experiences while maintaining transparency and decentralization.

---

Built for the IOPN Builder Contest.
