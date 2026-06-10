# OPN Quest Hub

A Web3 gamified quest platform built on IOPN Testnet.

Users can complete quests, earn on-chain points, unlock badges, claim NFTs, and participate in ecosystem activities.

---

## Live Demo

Frontend:

https://opn-points-tracker.vercel.app

GitHub:

https://github.com/builderonhub/opn-quest-hub

---

## Network

* Network: IOPN Testnet
* Chain ID: 984

Contract Address:

0x45C277439298AAF0952bC92236C78Aa138313a51

---

## Features
## S1 DeFi & Open Finance Module

OPN Quest Hub now includes an additional DeFi module designed for the S1 — DeFi & Open Finance track.

### OQH Token

OQH is the utility token of OPN Quest Hub.

- Token Name: OPN Quest Hub Token
- Symbol: OQH
- Network: IOPN Testnet

### OQH Faucet

Users can claim free test OQH tokens for staking.

- Claim amount: 1000 OQH
- Claim limit: once per day
- Reset time: 00:00 UTC

### OQH Staking Vault

Users can stake OQH tokens into the DeFi Vault and earn yield over time.

Features:

- Stake custom OQH amount
- Claim hourly yield rewards
- Withdraw staked OQH
- Rewards increase based on staking duration

### Yield Mechanism

The vault calculates rewards based on staking time.

Reward = Staked Amount × Hours Staked × Reward Rate

================

Current reward rate:

0.01% per hour

=================

### DeFi Flow

Claim OQH from Faucet
↓
Stake OQH in Vault
↓
Earn Hourly Yield
↓
Claim Rewards
↓
Withdraw OQH

------

### Deployed DeFi Contracts

------

OQH Token: "0xE76ac2dA2E36c9D1261759a2145a1c39d90712E4"

OQH Staking Vault: "0x697151A75Cbb649A22047F11bCD58B6c876bC611"

-----

### Why This Fits S1 — DeFi & Open Finance

This module adds DeFi mechanics to the original quest platform:

ERC20 utility token
Token faucet
Staking vault
Yield rewards
On-chain financial interaction

The project combines user engagement with DeFi incentives, turning OPN Quest Hub into a gamified open finance experience.

### Wallet Integration

* Connect MetaMask
* Connect OKX Wallet
* Automatic network switch to IOPN Testnet

---

### On-Chain Points System

All user points are stored on-chain.

Functions:

solidity
getPoints(address)

### Features:

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

solidity
canCheckIn(address)


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

solidity
completeQuest()
hasCompletedQuest()


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

solidity
claimNFT()
hasClaimedNFT()
tokenURI()


---

### NFT Metadata

IPFS Metadata CID:

bafybeievscabqzzk7cyu5r7djjfyn3465jjhvd6hf7fqhc275womva7lpi


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

provider.getTransactionCount(userAddress)


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

frontend/
contracts/
scripts/
artifacts/

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
