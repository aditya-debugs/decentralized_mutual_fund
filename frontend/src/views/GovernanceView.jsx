import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  Vote, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Clock, 
  PlusCircle, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from "lucide-react";

export default function GovernanceView() {
  const { 
    proposals, 
    balances, 
    voteOnProposal, 
    executeProposal, 
    notify 
  } = useWeb3();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [targetFund, setTargetFund] = useState("DGF");

  const votingPower = balances.dmf > 0 ? balances.dmf : 500;

  const handleCreateProposal = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    notify("Proposal Submitted", `"${newTitle}" created on-chain. Snapshot recorded at current block!`, "success");
    setShowCreateModal(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              <Vote size={14} />
              <span>Decentralized Autonomous Organization</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>
              Mutual Fund DAO Governance Portal
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "4px" }}>
              Unlike traditional mutual funds where opaque committees dictate strategy behind closed doors, 
              DMF token holders directly vote on portfolio allocations, fee parameters, and strategy manager appointments.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="stat-box" style={{ minWidth: "160px" }}>
              <div className="stat-label">Your Voting Weight</div>
              <div className="stat-value" style={{ color: "var(--accent-cyan)" }}>
                {votingPower.toFixed(0)} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>VOTES</span>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle size={16} />
              <span>New Proposal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {proposals.map((prop) => {
          const totalVotes = prop.forVotes + prop.againstVotes;
          const forPct = totalVotes > 0 ? (prop.forVotes / totalVotes) * 100 : 0;
          const againstPct = totalVotes > 0 ? (prop.againstVotes / totalVotes) * 100 : 0;
          const quorumPct = Math.min(100, (totalVotes / prop.quorum) * 100);

          return (
            <div key={prop.id} className="glass-panel" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span className="brand-badge" style={{ color: "var(--accent-purple)", borderColor: "rgba(139, 92, 246, 0.3)" }}>
                      Proposal #{prop.id}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Target: {prop.targetFund} Vault
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: prop.status === "Active" ? "rgba(0, 242, 254, 0.12)" : "rgba(16, 185, 129, 0.12)",
                        color: prop.status === "Active" ? "var(--accent-cyan)" : "var(--accent-emerald)",
                        border: prop.status === "Active" ? "1px solid rgba(0, 242, 254, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      {prop.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>{prop.title}</h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <Clock size={15} color="var(--accent-amber)" />
                  <span>{prop.votingEndsIn}</span>
                </div>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6", marginBottom: "20px" }}>
                {prop.description}
              </p>

              {/* Vote Progress Bar */}
              <div style={{ background: "rgba(0, 0, 0, 0.25)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "8px" }}>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>
                    YES: {prop.forVotes.toLocaleString()} Votes ({forPct.toFixed(1)}%)
                  </span>
                  <span style={{ color: "var(--accent-rose)", fontWeight: 700 }}>
                    NO: {prop.againstVotes.toLocaleString()} Votes ({againstPct.toFixed(1)}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", background: "#1e293b", marginBottom: "12px" }}>
                  <div style={{ width: `${forPct}%`, background: "var(--accent-emerald)", transition: "width 0.3s ease" }} />
                  <div style={{ width: `${againstPct}%`, background: "var(--accent-rose)", transition: "width 0.3s ease" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <span>Quorum: {totalVotes.toLocaleString()} / {prop.quorum.toLocaleString()} ({quorumPct.toFixed(0)}%)</span>
                  <span>Checkpoint: Snapshot Block Recorded (Flash-Loan Resistant)</span>
                </div>
              </div>

              {/* Voting & Execution Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                {prop.status === "Active" ? (
                  prop.hasVoted ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-emerald)", fontSize: "0.9rem", fontWeight: 700 }}>
                      <CheckCircle2 size={18} />
                      <span>You have already cast your vote on this proposal!</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="btn-primary btn-emerald"
                        onClick={() => voteOnProposal(prop.id, true)}
                      >
                        <CheckCircle2 size={16} />
                        <span>Vote YES (Approve)</span>
                      </button>
                      <button
                        className="btn-primary btn-rose"
                        onClick={() => voteOnProposal(prop.id, false)}
                      >
                        <XCircle size={16} />
                        <span>Vote NO (Reject)</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-emerald)", fontSize: "0.9rem", fontWeight: 700 }}>
                    <CheckCircle2 size={18} />
                    <span>Proposal Successfully Executed On-Chain</span>
                  </div>
                )}

                {/* Execute Button if conditions met */}
                {prop.status === "Active" && (
                  <button
                    className="btn-secondary"
                    onClick={() => executeProposal(prop.id)}
                    title="Simulate executing this passed proposal on the fund vault"
                  >
                    <Play size={14} color="var(--accent-cyan)" />
                    <span>Execute Proposal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Proposal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Submit DAO Governance Proposal</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateProposal}>
              <div className="input-group">
                <div className="input-label">Proposal Title</div>
                <div className="input-box">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Increase ETH allocation from 30% to 40%"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-label">Target Investment Vault</div>
                <div className="input-box">
                  <select
                    className="input-field"
                    value={targetFund}
                    onChange={(e) => setTargetFund(e.target.value)}
                    style={{ background: "transparent", color: "var(--text-primary)" }}
                  >
                    <option value="DGF" style={{ background: "#0c1017" }}>DeFi Growth Fund (DGF)</option>
                    <option value="CCF" style={{ background: "#0c1017" }}>Conservative Capital Fund (CCF)</option>
                    <option value="CBIF" style={{ background: "#0c1017" }}>Crypto Blue-Chip Index (CBIF)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <div className="input-label">Rationale & Strategy Specifications</div>
                <textarea
                  className="input-box"
                  rows={4}
                  style={{ width: "100%", background: "var(--bg-input)", color: "var(--text-primary)", resize: "none", padding: "10px 14px", fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}
                  placeholder="Detail the rationale for adjusting portfolio target weights..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "12px" }}>
                <span>Publish On-Chain Proposal</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
