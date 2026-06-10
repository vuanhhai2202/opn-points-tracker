// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockOPNToken is ERC20 {
    mapping(address => uint256) public lastClaimDay;
    constructor() ERC20("OPN Quest Hub Token", "OQH") {}

   function claimTestOPN() public {
    uint256 today = block.timestamp / 1 days;

    require(
        lastClaimDay[msg.sender] < today,
        "Faucet already claimed today"
    );

    lastClaimDay[msg.sender] = today;

    _mint(msg.sender, 1000 * 10 ** decimals());
   }
   function canClaimFaucet(address user)
    public
    view
    returns (bool)
{
    uint256 today = block.timestamp / 1 days;
    return lastClaimDay[user] < today;
}
}


