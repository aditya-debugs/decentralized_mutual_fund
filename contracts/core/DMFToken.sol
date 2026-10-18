// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DMFToken
 * @notice Protocol governance and reward token for the Decentralized Mutual Fund platform.
 * Supports snapshot-based voting checkpoints (ERC20Votes) to protect against flash loan attacks.
 */
contract DMFToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    mapping(address => bool) public minters;

    event MinterUpdated(address indexed minter, bool status);

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "DMF: Not authorized minter");
        _;
    }

    constructor(
        uint256 initialSupply
    ) ERC20("Decentralized Mutual Fund", "DMF") ERC20Permit("DMFToken") Ownable(msg.sender) {
        minters[msg.sender] = true;
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    function setMinter(address minter, bool status) external onlyOwner {
        minters[minter] = status;
        emit MinterUpdated(minter, status);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    // Required overrides for OpenZeppelin 5.0 ERC20Votes
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
