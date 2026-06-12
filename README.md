# OPN Quest Hub

A gamified Web3 engagement platform built on the IOPN Testnet.

OPN Quest Hub combines on-chain quests, NFT achievements, staking rewards, DeFi incentives, and community engagement into a single ecosystem experience.

Users can complete quests, earn points, unlock NFT badges, stake ecosystem assets, participate in DeFi activities, and build an on-chain reputation.

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

---

## Smart Contracts

### OPN Points & NFT Contract

Contract: 0x143538DC00D3C15bE393358Af029D8Ccc6323708

Core engagement contract responsible for:

* Daily Check-In Rewards
* Quest Rewards
* Activity Rewards
* NFT Achievement Claims
* Referral Rewards
* On-Chain Points Tracking

### OQH Token

Contract: 0xC88Fd59E170e3e27AF12427b1b461A4Dd2337aCd

Utility token used within OPN Quest Hub.

Features:

* ERC20 Token
* Daily Faucet
* Staking Utility

### OQH DeFi Vault

Contract: 0x9eb231B49da7099D1F61FdF07D0e7aB084628ECF

Features:

* Stake OQH
* Claim Rewards
* Withdraw OQH
* NFT Yield Boosts

### Native OPN Staking

Contract: 0x48D576bD6Ea0D311f7274DeC70219de228710770

Features:

* Stake Native OPN
* Earn Platform Points
* Claim Rewards
* Withdraw OPN

---

# Features

## Wallet Integration

* MetaMask Support
* OKX Wallet Support
* Automatic Network Detection
* Automatic IOPN Network Switching

---

## On-Chain Points System

All user points are stored on-chain.

Features:

* Daily Check-In Rewards
* Quest Rewards
* Referral Rewards
* Activity Milestone Rewards
* Transparent Point Tracking

Functions:

solidity
getPoints(address)

---

## Daily Check-In

Users can check in once per day.

Random rewards:

* 10 Points
* 20 Points
* 30 Points
* 40 Points
* 50 Points

Functions:

solidity
canCheckIn(address)


---

## Quest System

Current Quests:

* Follow IOPN
* Join Discord
* Share OPN Quest Hub
* Submit Feedback

Features:

* One-Time Completion
* On-Chain Reward Distribution
* Progress Tracking

Functions:

solidity
completeQuest()
hasCompletedQuest()


---

## Activity Milestones

Users earn additional rewards based on transaction activity.

Milestones:

| Transactions | Reward |
| ------------ | ------ |
| 1            | +1     |
| 10           | +5     |
| 50           | +15    |
| 100          | +30    |
| 500          | +75    |
| 1000         | +150   |
| 2000         | +300   |

Activity tracking is powered by:

javascript
provider.getTransactionCount(userAddress)

---

## NFT Achievement System

Users unlock achievement NFTs through participation.

### Bronze NFT

Requirement:

* 100 Points

### Silver NFT

Requirement:

* 500 Points

### Gold NFT

Requirement:

* 1000 Points

Functions:

solidity
claimNFT()
hasClaimedNFT()
tokenURI()

---

## NFT Utility Boosts

Achievement NFTs provide DeFi benefits.

### Bronze NFT

+10% staking rewards

### Silver NFT

+25% staking rewards

### Gold NFT

+50% staking rewards

NFT boosts are automatically applied within the OQH Vault.

---

## OQH Faucet

Users can claim free OQH tokens for testing and staking.

Features:

* 1000 OQH per claim
* Once per day per wallet
* Faucet eligibility checking

---

## OQH DeFi Vault

Users can stake OQH and earn yield.

Features:

* Stake OQH
* Claim Rewards
* Withdraw OQH
* Real-Time Reward Tracking
* NFT Reward Multipliers
* Total OQH Staked Dashboard

Current Reward Rate:

* 0.2% per hour

DeFi Flow:

Claim OQH
↓
Stake OQH
↓
Earn Rewards
↓
Claim Rewards
↓
Withdraw OQH

---

## Native OPN Staking

Users can stake native OPN and earn platform points.

Features:

* Stake OPN
* Claim Points
* Withdraw OPN
* Personal Statistics Dashboard
* Total OPN Staked Dashboard

Reward Model:

* 1 OPN = 0.1 Point per Minute

---

## Leaderboard

Current Version:

* Top 20 Users
* Point-Based Ranking
* Real-Time Updates

Future Expansion:

* Top Stakers
* Top NFT Holders
* Seasonal Rankings

---

## Referral System

Referral rewards are recorded on-chain.

Features:

* Invite Friends
* Referral Tracking
* One-Time Referral Claim
* Referrer Point Rewards

---

## User Profile Dashboard

Displays:

* Wallet Address
* Total Points
* Badge Rank
* Next Check-In Timer
* Contract Information

---

## Security

Current Status:

* Testnet MVP
* Not yet audited

Security Measures:

* Solidity ^0.8.x overflow protection
* OpenZeppelin ERC20 and ERC721 standards
* One-time quest claims
* One-time NFT claims
* One-time referral claims
* Daily faucet restrictions
* Daily check-in restrictions

Planned Improvements:

* ReentrancyGuard integration
* Additional contract reviews
* Formal security audit before mainnet deployment

---

## Technology Stack

* Solidity
* Hardhat
* Ethers.js
* Vite
* JavaScript
* HTML
* CSS
* IPFS
* Vercel

---

## Project Structure


frontend/
contracts/
scripts/
artifacts/


---

## Vision

OPN Quest Hub aims to become the engagement and reward layer of the IOPN ecosystem.

By combining quests, NFTs, staking, DeFi incentives, and reputation systems, the platform creates a transparent participation economy where user contributions and achievements are rewarded fully on-chain.

---

Built for the IOPN Builder Contest.
