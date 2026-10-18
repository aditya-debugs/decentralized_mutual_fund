// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFlashLoanReceiver {
    function executeOperation(
        address token,
        uint256 amount,
        bytes calldata params
    ) external returns (bool);
}

/**
 * @title FlashLoanPool
 * @notice Educational Flash Loan provider for testing and demonstrating DeFi attacks.
 */
contract FlashLoanPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    event FlashLoanExecuted(address indexed borrower, address indexed token, uint256 amount);

    function flashLoan(
        address tokenAddress,
        uint256 amount,
        bytes calldata params
    ) external nonReentrant {
        IERC20 token = IERC20(tokenAddress);
        uint256 balanceBefore = token.balanceOf(address(this));
        require(balanceBefore >= amount, "FlashLoan: Insufficient pool liquidity");

        // 1. Transfer borrowed funds to receiver
        token.safeTransfer(msg.sender, amount);

        // 2. Trigger receiver execution hook
        bool success = IFlashLoanReceiver(msg.sender).executeOperation(tokenAddress, amount, params);
        require(success, "FlashLoan: Execution hook failed");

        // 3. Verify loan was fully repaid
        uint256 balanceAfter = token.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "FlashLoan: Loan not repaid");

        emit FlashLoanExecuted(msg.sender, tokenAddress, amount);
    }
}
