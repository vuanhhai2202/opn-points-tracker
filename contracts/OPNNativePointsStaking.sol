// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract OPNNativePointsStaking {
    uint256 public constant POINTS_PER_1_OPN_PER_HOUR_BPS = 1000; 
    uint256 public totalStaked;

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public claimedPoints;
    mapping(address => uint256) public lastClaimTime;

    function stake() external payable {
        require(msg.value > 0, "Amount must be > 0");

        _claimPoints(msg.sender);

        stakedAmount[msg.sender] += msg.value;
        totalStaked += msg.value;

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

        payable(msg.sender).transfer(amount);
    }

    function claimPoints() external {
        _claimPoints(msg.sender);
    }

    function pendingPoints(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0 || lastClaimTime[user] == 0) {
            return 0;
        }

        uint256 minutesPassed =
            (block.timestamp - lastClaimTime[user]) / 1 minutes;

        return (stakedAmount[user] * minutesPassed) / (10 * 1 ether);
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