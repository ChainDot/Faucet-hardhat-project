// SPDX-License-Identifier: MIT
//Faucet deployed on rinkeby at 0xbf9aa861908CB356C5c90f18C688b56DB9540a59

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract Faucet {
    // ERC20 distributed by the faucet
    IERC20Metadata private _token;

    // time restriction following the address of the faucet user
    mapping(address => uint256) private _countdown;

    // fixed number of tokens send by the Faucet 100 Froggies
    uint256 private constant _VALUE = 100 * 10**18;

    // time restriction in secondes or equal to 3 days
    uint256 private constant _TIME_RESTRICTION = 259200;

    // address of the token supplier
    address private _ownerSupplyAddress;

    //EVENTS

    event Transfer(address indexed sender, address indexed recipient, uint256 amount);

    constructor(address ownerSupplyAddress_, address froggiesAddress_) {
        _token = IERC20Metadata(froggiesAddress_);
        _ownerSupplyAddress = ownerSupplyAddress_;
    }

    function getTokens() public {
        require(_countdown[msg.sender] < block.timestamp, "Faucet: You cannot get more tokens at the moment chill out");
        require(ownerTokenSupply() >= _VALUE, "Faucet: sorry not more tokens available");
        _countdown[msg.sender] = block.timestamp + _TIME_RESTRICTION;
        _token.transferFrom(_ownerSupplyAddress, msg.sender, _VALUE);
        emit Transfer(_ownerSupplyAddress, msg.sender, _VALUE);
    }

    //getters

    // Returns the owner address of the supplied token.
    function ownerSupplyAddress() public view returns (address) {
        return _ownerSupplyAddress;
    }

    function ownerTokenSupply() public view returns (uint256) {
        return _token.balanceOf(_ownerSupplyAddress);
    }

    //returns contract address of Froggies token
    function tokenAddress() public view returns (IERC20Metadata) {
        return _token;
    }

    // returns time remaining before you can use the faucet in secondes
    function countdown() public view returns (uint256) {
        if (_countdown[msg.sender] >= block.timestamp) {
            uint256 remaining = _countdown[msg.sender] - block.timestamp;
            return remaining;
        } else {
            return 0;
        }
    }

    function value() public pure returns (uint256) {
        return _VALUE;
    }

    function timeRestriction() public pure returns (uint256) {
        return _TIME_RESTRICTION;
    }
}
