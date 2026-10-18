// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VulnerableDAO
 * @notice Educational demonstration of a flawed governance contract.
 * Flaw: Determines voting power using instant `balanceOf(msg.sender)` instead of
 * historical snapshots (ERC20Votes).
 * Susceptible to flash-loan voting attacks within a single transaction!
 */
contract VulnerableDAO {
    IERC20 public immutable governanceToken;

    struct Proposal {
        uint256 id;
        string description;
        address target;
        bytes callData;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, string description);
    event Voted(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    event Executed(uint256 indexed id);

    constructor(address tokenAddress) {
        governanceToken = IERC20(tokenAddress);
    }

    function createProposal(string memory description, address target, bytes memory callData) external returns (uint256) {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: description,
            target: target,
            callData: callData,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });
        emit ProposalCreated(proposalCount, description);
        return proposalCount;
    }

    /**
     * @notice VULNERABLE FUNCTION:
     * Reads instantaneous balance of msg.sender without snapshot or lock.
     * A flash-loan borrower can call this, vote with borrowed tokens, and sway the DAO!
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "VulnerableDAO: Invalid proposal");
        require(!hasVoted[proposalId][msg.sender], "VulnerableDAO: Already voted");

        uint256 votingPower = governanceToken.balanceOf(msg.sender);
        require(votingPower > 0, "VulnerableDAO: Zero voting power");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }

        emit Voted(proposalId, msg.sender, support, votingPower);
    }

    function execute(uint256 proposalId) external returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Defeated");

        proposal.executed = true;
        if (proposal.target != address(0) && proposal.callData.length > 0) {
            (bool ok, ) = proposal.target.call(proposal.callData);
            require(ok, "Execution failed");
        }
        emit Executed(proposalId);
        return true;
    }
}
