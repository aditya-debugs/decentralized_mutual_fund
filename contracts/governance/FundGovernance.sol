// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FundGovernance
 * @notice On-chain DAO governance for the Decentralized Mutual Fund platform.
 * Enables proposals for strategy reallocations, fee adjustments, and protocol parameters.
 * Uses snapshot-based voting (ERC20Votes) to calculate voting power at proposal creation block,
 * inherently preventing flash-loan manipulation.
 */
contract FundGovernance is ReentrancyGuard, Ownable {
    IVotes public immutable governanceToken; // DMF or Vault Token

    enum ProposalState { Pending, Active, Defeated, Succeeded, Executed }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        address targetContract;
        bytes callData;
        uint256 snapshotBlock;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    uint256 public proposalCount;
    uint256 public votingPeriodBlocks = 100; // configurable voting window
    uint256 public quorumVotes = 1000 * 1e18; // minimum votes required

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        address targetContract,
        uint256 startBlock,
        uint256 endBlock
    );
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        bool support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(
        address governanceToken_,
        uint256 quorum_
    ) Ownable(msg.sender) {
        governanceToken = IVotes(governanceToken_);
        if (quorum_ > 0) {
            quorumVotes = quorum_;
        }
    }

    /**
     * @notice Create a new governance proposal
     */
    function createProposal(
        string memory title,
        string memory description,
        address targetContract,
        bytes memory callData
    ) external returns (uint256) {
        proposalCount++;
        uint256 proposalId = proposalCount;

        uint256 currentBlock = block.number;
        uint256 snapshot = currentBlock > 0 ? currentBlock - 1 : 0;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            targetContract: targetContract,
            callData: callData,
            snapshotBlock: snapshot,
            startBlock: currentBlock,
            endBlock: currentBlock + votingPeriodBlocks,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });

        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            targetContract,
            currentBlock,
            currentBlock + votingPeriodBlocks
        );

        return proposalId;
    }

    /**
     * @notice Cast vote on proposal (support: true = YES, false = NO)
     * Voting power is fetched from the snapshot block via IVotes.getPastVotes
     */
    function castVote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "DAO: Proposal not found");
        require(block.number <= proposal.endBlock, "DAO: Voting ended");
        require(!hasVoted[proposalId][msg.sender], "DAO: Already voted");

        uint256 weight = governanceToken.getPastVotes(msg.sender, proposal.snapshotBlock);
        require(weight > 0, "DAO: No voting weight at snapshot");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit VoteCast(msg.sender, proposalId, support, weight);
    }

    /**
     * @notice Execute a passed proposal
     */
    function executeProposal(uint256 proposalId) external nonReentrant returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "DAO: Proposal not found");
        require(!proposal.executed, "DAO: Already executed");
        require(block.number > proposal.endBlock, "DAO: Voting period active");
        require(proposal.forVotes > proposal.againstVotes, "DAO: Proposal defeated");
        require(proposal.forVotes + proposal.againstVotes >= quorumVotes, "DAO: Quorum not met");

        proposal.executed = true;

        if (proposal.targetContract != address(0) && proposal.callData.length > 0) {
            (bool success, ) = proposal.targetContract.call(proposal.callData);
            require(success, "DAO: Execution failed");
        }

        emit ProposalExecuted(proposalId);
        return true;
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.id == 0) return ProposalState.Pending;
        if (proposal.executed) return ProposalState.Executed;
        if (block.number <= proposal.endBlock) return ProposalState.Active;
        if (proposal.forVotes > proposal.againstVotes && (proposal.forVotes + proposal.againstVotes >= quorumVotes)) {
            return ProposalState.Succeeded;
        }
        return ProposalState.Defeated;
    }

    function setVotingPeriod(uint256 newPeriod) external onlyOwner {
        votingPeriodBlocks = newPeriod;
    }

    function setQuorum(uint256 newQuorum) external onlyOwner {
        quorumVotes = newQuorum;
    }
}
