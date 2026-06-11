// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OPNPointsStaking {
    IERC20 public immutable opnToken;

    uint256 public constant POINTS_PER_100_OPN_PER_HOUR = 1;
    uint256 public totalStaked;

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public claimedPoints;
    mapping(address => uint256) public lastClaimTime;

    constructor(address _opnToken) {
        opnToken = IERC20(_opnToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        _claimPoints(msg.sender);

        opnToken.transferFrom(msg.sender, address(this), amount);

        stakedAmount[msg.sender] += amount;
        totalStaked += amount;

        if (lastClaimTime[msg.sender] == 0) {
            lastClaimTime[msg.sender] = block.timestamp;
        }
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(stakedAmount[msg.sender] >= amount, "Not enough staked");

        _claimPoints(msg.sender);

        stakedAmount[msg.sender] -= amount;
        totalStaked -= amount;

        opnToken.transfer(msg.sender, amount);
    }

    function claimPoints() external {
        _claimPoints(msg.sender);
    }

    function pendingPoints(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0 || lastClaimTime[user] == 0) {
            return 0;
        }

        uint256 hoursPassed = (block.timestamp - lastClaimTime[user]) / 1 hours;

        return (stakedAmount[user] * hoursPassed * POINTS_PER_100_OPN_PER_HOUR) / (100 * 10 ** 18);
    }

    function totalUserPoints(address user) external view returns (uint256) {
        return claimedPoints[user] + pendingPoints(user);
    }

    function _claimPoints(address user) internal {
        uint256 pending = pendingPoints(user);

        if (pending > 0) {
            claimedPoints[user] += pending;
        }

        lastClaimTime[user] = block.timestamp;
    }
}