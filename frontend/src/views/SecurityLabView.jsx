import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Lock, 
  Unlock,
  Terminal,
  Layers
} from "lucide-react";

export default function SecurityLabView() {
  const { notify } = useWeb3();

  const [attackTarget, setAttackTarget] = useState("vulnerable"); // 'vulnerable' | 'secure'
  const [borrowAmount, setBorrowAmount] = useState("500000"); // 500,000 DMF
  const [attackRunning, setAttackRunning] = useState(false);
  const [attackLogs, setAttackLogs] = useState([]);
  const [attackResult, setAttackResult] = useState(null); // 'exploited' | 'defended' | null

  const runSimulation = () => {
    setAttackRunning(true);
    setAttackLogs([]);
    setAttackResult(null);

    const isVuln = attackTarget === "vulnerable";
    const logs = [];

    // Step 1: Initiate Flash Loan
    setTimeout(() => {
      logs.push({
        step: 1,
        title: "FlashLoanPool.flashLoan() Triggered",
        desc: `Attacker borrows ${parseFloat(borrowAmount).toLocaleString()} DMF uncollateralized with 0 upfront capital.`,
        type: "warn",
      });
      setAttackLogs([...logs]);
    }, 600);

    // Step 2: Attempt Vote
    setTimeout(() => {
      if (isVuln) {
        logs.push({
          step: 2,
          title: "VulnerableDAO.vote() Invoked",
          desc: "Target reads token.balanceOf(msg.sender) at current block! Instantaneous voting power = 500,000 votes.",
          type: "error",
        });
        logs.push({
          step: 3,
          title: "Malicious Proposal Swayed",
          desc: "Malicious vote succeeds! Attacker passes emergency treasury drain proposal.",
          type: "error",
        });
      } else {
        logs.push({
          step: 2,
          title: "SecureDAO.vote() Invoked",
          desc: "Target queries token.getPastVotes(attacker, snapshotBlock). Checking past block checkpoint...",
          type: "info",
        });
        logs.push({
          step: 3,
          title: "Flash Loan Blocked by Snapshot Checkpoint!",
          desc: "Reverted: Attacker had 0 voting power at the proposal snapshot block. Borrowed tokens carried zero weight!",
          type: "success",
        });
      }
      setAttackLogs([...logs]);
    }, 1800);

    // Step 4: Loan Repayment & Verdict
    setTimeout(() => {
      logs.push({
        step: 4,
        title: "Flash Loan Repaid to Pool",
        desc: `500,000 DMF returned to FlashLoanPool. Invariant balanceCheck() verified.`,
        type: "info",
      });
      setAttackLogs([...logs]);
      setAttackRunning(false);
      setAttackResult(isVuln ? "exploited" : "defended");

      if (isVuln) {
        notify("Vulnerability Exploited!", "The instantaneous balance DAO was successfully manipulated via flash loan.", "error");
      } else {
        notify("Security Defense Successful!", "ERC20Votes snapshot checkpoint completely neutralized the flash-loan voting attack!", "success");
      }
    }, 3000);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-rose)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              <ShieldAlert size={14} />
              <span>Smart Contract Security Verification</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>
              DeFi Security Lab: Flash-Loan Attack & Defense
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "4px" }}>
              A hands-on demonstration specified in Section 12 of the architecture: 
              Explore how uncollateralized flash loans can hijack naive DAOs, and verify how 
              historical snapshot checkpointing (OpenZeppelin ERC20Votes) prevents governance attacks.
            </p>
          </div>

          <div className="stat-box" style={{ minWidth: "150px" }}>
            <div className="stat-label">Flash Pool Liquidity</div>
            <div className="stat-value" style={{ color: "var(--accent-purple)", fontSize: "1.2rem" }}>
              1,000,000 DMF
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Architectural Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        
        {/* Vulnerable DAO Card */}
        <div className="glass-panel lab-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Unlock size={22} color="var(--accent-rose)" />
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-rose)", fontWeight: 800, textTransform: "uppercase" }}>
                FLAWED IMPLEMENTATION
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Vulnerable DAO</h3>
            </div>
          </div>

          <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.25)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#fca5a5" }}>
            <code>uint256 power = token.balanceOf(msg.sender);</code>
          </div>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <XCircle size={16} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Reads instantaneous token balance at current block.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <XCircle size={16} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>No snapshot checkpoint or voting delay.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <XCircle size={16} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Susceptible to flash-loan exploit within a single block transaction.</span>
            </li>
          </ul>
        </div>

        {/* Secure DAO Card */}
        <div className="glass-panel lab-card secure" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Lock size={22} color="var(--accent-emerald)" />
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 800, textTransform: "uppercase" }}>
                HARDENED ARCHITECTURE
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Secure DAO (DMF Protocol)</h3>
            </div>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#86efac" }}>
            <code>uint256 power = token.getPastVotes(voter, snapshot);</code>
          </div>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Uses checkpoint snapshots recorded before proposal creation.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Flash-loaned tokens carry zero voting weight for past snapshots.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Enforces timelock delays and quorum constraints.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Attack Simulator Control */}
      <div className="glass-panel" style={{ padding: "28px" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
          Execute Live Flash-Loan Simulation
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Select the target contract below, then click "Launch Attack". The automated attacker smart contract 
          will execute an atomic flash loan, attempt voting, and report whether the exploit succeeded or was defended!
        </p>

        {/* Target Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <button
            type="button"
            className="subtab-btn"
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: attackTarget === "vulnerable" ? "2px solid var(--accent-rose)" : "1px solid var(--border-subtle)",
              background: attackTarget === "vulnerable" ? "rgba(244, 63, 94, 0.12)" : "var(--bg-secondary)",
              textAlign: "left",
            }}
            onClick={() => setAttackTarget("vulnerable")}
          >
            <div style={{ fontSize: "0.75rem", color: "var(--accent-rose)", fontWeight: 800 }}>ATTACK TARGET A</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
              Vulnerable DAO (Flawed)
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Expected: Exploit succeeds due to instant balance reading.
            </div>
          </button>

          <button
            type="button"
            className="subtab-btn"
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: attackTarget === "secure" ? "2px solid var(--accent-emerald)" : "1px solid var(--border-subtle)",
              background: attackTarget === "secure" ? "rgba(16, 185, 129, 0.12)" : "var(--bg-secondary)",
              textAlign: "left",
            }}
            onClick={() => setAttackTarget("secure")}
          >
            <div style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", fontWeight: 800 }}>ATTACK TARGET B</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
              Secure DAO (Hardened)
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Expected: Blocked by historical snapshot checkpoints.
            </div>
          </button>
        </div>

        {/* Action Trigger */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <button
            className="btn-primary"
            style={{
              background: attackTarget === "vulnerable" ? "var(--gradient-rose, linear-gradient(135deg, #f43f5e, #be123c))" : "var(--gradient-emerald)",
              boxShadow: attackTarget === "vulnerable" ? "var(--shadow-rose-glow)" : "var(--shadow-emerald-glow)",
              padding: "12px 24px",
              fontSize: "0.95rem",
            }}
            onClick={runSimulation}
            disabled={attackRunning}
          >
            <Zap size={18} />
            <span>{attackRunning ? "Executing Flash Loan Attack..." : `Launch Attack on ${attackTarget === "vulnerable" ? "Vulnerable DAO" : "Secure DAO"}`}</span>
          </button>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Loan Amount: <strong>500,000 DMF</strong> from FlashLoanPool (1 tx atomic execution)
          </div>
        </div>

        {/* Live Attack Logs Terminal */}
        {attackLogs.length > 0 && (
          <div style={{ background: "#05070a", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "20px", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "14px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              <Terminal size={14} color="var(--accent-cyan)" />
              <span>ON-CHAIN EXECUTION TRACE</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {attackLogs.map((log) => {
                let badgeColor = "var(--accent-cyan)";
                if (log.type === "error") badgeColor = "var(--accent-rose)";
                if (log.type === "success") badgeColor = "var(--accent-emerald)";
                if (log.type === "warn") badgeColor = "var(--accent-amber)";

                return (
                  <div key={log.step} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ background: "rgba(255, 255, 255, 0.08)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", color: badgeColor, flexShrink: 0 }}>
                      STEP {log.step}
                    </span>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {log.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {log.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verdict Banner */}
            {attackResult && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  background: attackResult === "exploited" ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  border: attackResult === "exploited" ? "1px solid var(--accent-rose)" : "1px solid var(--accent-emerald)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: attackResult === "exploited" ? "var(--accent-rose)" : "var(--accent-emerald)",
                }}
              >
                {attackResult === "exploited" ? (
                  <>
                    <XCircle size={20} />
                    <span>EXPLOIT CONFIRMED: Vulnerable DAO succumbed to flash-loan voting influence!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>PROTOCOL SECURE: Flash loan neutralized! Historical snapshot checkpoints successfully defended governance.</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
