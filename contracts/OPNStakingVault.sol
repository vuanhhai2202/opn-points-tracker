// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OPNStakingVault {
    IERC20 public opnToken;

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakeStartTime;
    mapping(address => uint256) public rewardClaimed;

    uint256 public constant REWARD_RATE_PER_HOUR_BPS = 1; // 0.01% per hour
    uint256 public constant BPS_DENOMINATOR = 10000;

    event Staked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _opnToken) {
        opnToken = IERC20(_opnToken);
    }

    function stake(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");

        if (stakedAmount[msg.sender] == 0) {
            stakeStartTime[msg.sender] = block.timestamp;
        }

        opnToken.transferFrom(msg.sender, address(this), amount);
        stakedAmount[msg.sender] += amount;

        emit Staked(msg.sender, amount);
    }

    function stakingHours(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0) {
            return 0;
        }

        return (block.timestamp - stakeStartTime[user]) / 1 hours;
    }

    function pendingReward(address user) public view returns (uint256) {
        uint256 hoursStaked = stakingHours(user);

        uint256 totalReward =
            (stakedAmount[user] * hoursStaked * REWARD_RATE_PER_HOUR_BPS) / BPS_DENOMINATOR;

        if (totalReward <= rewardClaimed[user]) {
            return 0;
        }

        return totalReward - rewardClaimed[user];
    }

    function claimReward() public {
        uint256 reward = pendingReward(msg.sender);
        require(reward > 0, "No reward available");

        rewardClaimed[msg.sender] += reward;
        opnToken.transfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function withdraw() public {
        uint256 amount = stakedAmount[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        uint256 reward = pendingReward(msg.sender);

        stakedAmount[msg.sender] = 0;
        stakeStartTime[msg.sender] = 0;
        rewardClaimed[msg.sender] = 0;

        if (reward > 0) {
            opnToken.transfer(msg.sender, reward);
        }

        opnToken.transfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }
}