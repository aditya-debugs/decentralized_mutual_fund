import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  Sprout, 
  Coins, 
  Flame, 
  Sparkles, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CheckCircle2, 
  Vote,
  TrendingUp
} from "lucide-react";

export default function YieldFarmingView() {
  const { 
    balances, 
    stakeLP, 
    unstakeLP, 
    claimFarmRewards 
  } = useWeb3();

  const [stakeAmount, setStakeAmount] = useState("10");
  const [unstakeAmount, setUnstakeAmount] = useState("10");

  const handleStake = (e) => {
    e.preventDefault();
    const val = parseFloat(stakeAmount);
    if (!val || val <= 0) return;
    const ok = stakeLP(val);
    if (ok) setStakeAmount("");
  };

  const handleUnstake = (e) => {
    e.preventDefault();
    const val = parseFloat(unstakeAmount);
    if (!val || val <= 0) return;
    const ok = unstakeLP(val);
    if (ok) setUnstakeAmount("");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-purple)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              <Sprout size={14} />
              <span>Liquidity Mining & Staking Engine</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>
              Stake LP Tokens ➔ Farm DMF Protocol Rewards
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "4px" }}>
              Provide deep liquidity to the secondary market. Stake your DGF-USDC LP tokens in the yield vault to earn continuous DMF (Decentralized Mutual Fund) governance tokens!
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div className="stat-box" style={{ minWidth: "140px" }}>
              <div className="stat-label">Farming APR</div>
              <div className="stat-value" style={{ color: "var(--accent-emerald)" }}>34.2%</div>
            </div>
            <div className="stat-box" style={{ minWidth: "140px" }}>
              <div className="stat-label">Emission Rate</div>
              <div className="stat-value" style={{ color: "var(--accent-cyan)" }}>1.0 DMF/s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Staking Vault Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column: Farm Actions */}
        <div className="glass-panel" style={{ padding: "28px" }}>
          {/* Live Pending Rewards Showcase */}
          <div style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(16, 22, 34, 0.9) 100%)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "16px", padding: "24px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-purple)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Unclaimed Protocol Rewards
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "4px" }}>
                <span style={{ fontSize: "2.4rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                  {balances.pendingDMF.toFixed(4)}
                </span>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-purple)" }}>
                  DMF
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                Accumulating continuously while LP is staked!
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ background: "var(--gradient-purple)", boxShadow: "0 4px 14px rgba(139, 92, 246, 0.3)" }}
              onClick={claimFarmRewards}
              disabled={balances.pendingDMF <= 0}
            >
              <Sparkles size={16} />
              <span>Harvest Rewards</span>
            </button>
          </div>

          {/* Stake & Unstake Controls */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            {/* Stake Box */}
            <div style={{ background: "rgba(0, 0, 0, 0.25)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ArrowDownCircle size={16} color="var(--accent-emerald)" />
                <span>Stake LP Tokens</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Available in Wallet: <strong>{balances.lpTokens.toFixed(2)} LP</strong>
              </div>

              <form onSubmit={handleStake}>
                <div className="input-box" style={{ marginBottom: "12px" }}>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="0.0"
                    className="input-field"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-quick-btn"
                    onClick={() => setStakeAmount(balances.lpTokens.toString())}
                  >
                    MAX
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary btn-emerald" 
                  style={{ width: "100%" }}
                  disabled={balances.lpTokens <= 0}
                >
                  <span>Stake LP</span>
                </button>
              </form>
            </div>

            {/* Unstake Box */}
            <div style={{ background: "rgba(0, 0, 0, 0.25)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ArrowUpCircle size={16} color="var(--accent-rose)" />
                <span>Unstake LP Tokens</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Currently Staked: <strong>{balances.stakedLP.toFixed(2)} LP</strong>
              </div>

              <form onSubmit={handleUnstake}>
                <div className="input-box" style={{ marginBottom: "12px" }}>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="0.0"
                    className="input-field"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-quick-btn"
                    onClick={() => setUnstakeAmount(balances.stakedLP.toString())}
                  >
                    MAX
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="btn-secondary" 
                  style={{ width: "100%" }}
                  disabled={balances.stakedLP <= 0}
                >
                  <span>Unstake LP</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: User Staking Summary & DMF Utility */}
        <div>
          {/* User Staking Status */}
          <div className="glass-panel" style={{ padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>
              Your Farming Position
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(0, 0, 0, 0.2)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Staked LP Balance</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-emerald)" }}>
                  {balances.stakedLP.toFixed(2)} LP
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Harvested DMF in Wallet</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-purple)" }}>
                  {balances.dmf.toFixed(2)} DMF
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>DAO Voting Power</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
                  {balances.dmf > 0 ? balances.dmf.toFixed(0) : "500"} Votes
                </span>
              </div>
            </div>
          </div>

          {/* DMF Token Utility (Page 6 PDF) */}
          <div className="glass-panel" style={{ padding: "24px", background: "rgba(16, 22, 34, 0.85)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Vote size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>DMF Token Utility</h4>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>DAO Governance:</strong> Vote on fund allocation changes & protocol risk parameters.</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Fee Sharing:</strong> Staked DMF earns a share of protocol management & DEX trading fees.</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Liquidity Incentives:</strong> Long-term LP holders are continuously rewarded.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
