// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";

/**
 * @title SecureDAO
 * @notice Educational demonstration of a hardened DAO governance contract.
 * Uses historical snapshot checkpointing (ERC20Votes getPastVotes) to determine voting weight.
 * Tokens acquired in the current block via flash loans carry 0 voting weight for prior proposals!
 */
contract SecureDAO {
    IVotes public immutable governanceToken;

    struct Proposal {
        uint256 id;
        string description;
        address target;
        bytes callData;
        uint256 snapshotBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, string description, uint256 snapshotBlock);
    event Voted(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    event Executed(uint256 indexed id);

    constructor(address tokenAddress) {
        governanceToken = IVotes(tokenAddress);
    }

    function createProposal(string memory description, address target, bytes memory callData) external returns (uint256) {
        proposalCount++;
        uint256 currentBlock = block.number;
        uint256 snapshot = currentBlock > 0 ? currentBlock - 1 : 0;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: description,
            target: target,
            callData: callData,
            snapshotBlock: snapshot,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });

        emit ProposalCreated(proposalCount, description, snapshot);
        return proposalCount;
    }

    /**
     * @notice SECURE VOTING FUNCTION:
     * Calculates voting power based on historical snapshot checkpoints.
     * Tokens borrowed via flash loan in the current block have 0 past votes at snapshotBlock!
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "SecureDAO: Invalid proposal");
        require(!hasVoted[proposalId][msg.sender], "SecureDAO: Already voted");

        uint256 votingPower = governanceToken.getPastVotes(msg.sender, proposal.snapshotBlock);
        require(votingPower > 0, "SecureDAO: Zero voting power at snapshot (Flash Loan Defended!)");

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
