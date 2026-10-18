import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  TrendingUp, 
  Layers,
  Zap,
  RefreshCw
} from "lucide-react";

export default function FundDetailView({ selectedFundId = "dgf" }) {
  const { 
    funds, 
    balances, 
    depositIntoVault, 
    redeemFromVault, 
    simulateYieldGain 
  } = useWeb3();

  const [currentFundId, setCurrentFundId] = useState(selectedFundId);
  const [activeTab, setActiveTab] = useState("deposit"); // 'deposit' | 'redeem'
  const [amount, setAmount] = useState("1000"); // default 1,000 USDC as in PDF

  const fund = funds.find((f) => f.id === currentFundId) || funds[0];
  const userFundShares = balances[fund.id] || 0;
  const userPositionValue = userFundShares * fund.sharePrice;

  const handleAction = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    if (activeTab === "deposit") {
      const ok = depositIntoVault(fund.id, val);
      if (ok) setAmount("");
    } else {
      const ok = redeemFromVault(fund.id, val);
      if (ok) setAmount("");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Top Fund Switcher Selector */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
        {funds.map((f) => (
          <button
            key={f.id}
            onClick={() => setCurrentFundId(f.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: currentFundId === f.id ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
              background: currentFundId === f.id ? "rgba(0, 242, 254, 0.12)" : "var(--bg-secondary)",
              color: currentFundId === f.id ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>{f.symbol}</span>
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column: Fund Overview & Interactive Yield Simulation */}
        <div>
          {/* Fund Info Header Card */}
          <div className="glass-panel" style={{ padding: "28px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span className="brand-badge" style={{ marginBottom: "6px", display: "inline-block" }}>
                  ERC-4626 Tokenized Vault
                </span>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>{fund.name}</h1>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
                  Strategy: {fund.strategy}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Share Price (NAV)</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                  ${fund.sharePrice.toFixed(4)}
                </div>
                <span style={{ fontSize: "0.85rem", color: "var(--accent-emerald)", fontWeight: 700 }}>
                  {fund.historicalPerf}
                </span>
              </div>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6", margin: "16px 0" }}>
              {fund.description}
            </p>

            {/* Live Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "rgba(0, 0, 0, 0.25)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Vault Total Value Locked</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                  ${fund.tvl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USDC
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Shares in Circulation</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                  {fund.shares.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {fund.symbol}
                </div>
              </div>
            </div>

            {/* Target Asset Allocation */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Smart-Contract Target Allocation</span>
                <span style={{ color: "var(--accent-cyan)" }}>DAO Governed</span>
              </div>
              <div className="allocation-bar" style={{ height: "10px" }}>
                <div className="alloc-segment alloc-stable" style={{ width: `${fund.allocation.stable}%` }} />
                <div className="alloc-segment alloc-eth" style={{ width: `${fund.allocation.eth}%` }} />
                <div className="alloc-segment alloc-lp" style={{ width: `${fund.allocation.lp}%` }} />
                <div className="alloc-segment alloc-res" style={{ width: `${fund.allocation.reserve}%` }} />
              </div>
              <div className="alloc-legend" style={{ marginTop: "6px" }}>
                <span className="alloc-legend-item">
                  <span className="legend-dot" style={{ background: "#10b981" }}></span>
                  <span>Stable ({fund.allocation.stable}%)</span>
                </span>
                <span className="alloc-legend-item">
                  <span className="legend-dot" style={{ background: "#3b82f6" }}></span>
                  <span>ETH ({fund.allocation.eth}%)</span>
                </span>
                <span className="alloc-legend-item">
                  <span className="legend-dot" style={{ background: "#8b5cf6" }}></span>
                  <span>LP Pools ({fund.allocation.lp}%)</span>
                </span>
                <span className="alloc-legend-item">
                  <span className="legend-dot" style={{ background: "#f59e0b" }}></span>
                  <span>Reserve ({fund.allocation.reserve}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Yield Simulation Panel (PDF Section 7 Demonstration) */}
          <div className="glass-panel" style={{ padding: "24px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 22, 34, 0.9) 100%)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Sparkles size={20} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                Interactive Strategy Performance Simulator
              </h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.5", marginBottom: "16px" }}>
              Test how the ERC-4626 vault mathematically distributes gains: When strategies generate profits, 
              the underlying assets grow while share count remains constant, automatically appreciating the Net Asset Value (NAV) per share!
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                className="btn-primary btn-emerald"
                onClick={() => simulateYieldGain(fund.id, 10)}
              >
                <Zap size={16} />
                <span>Simulate +10% Strategy Profit</span>
              </button>
              <button
                className="btn-secondary"
                onClick={() => simulateYieldGain(fund.id, 5)}
              >
                <span>+5% Gain</span>
              </button>
            </div>

            <div style={{ marginTop: "16px", padding: "12px 14px", background: "rgba(0, 0, 0, 0.3)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-secondary)", borderLeft: "3px solid var(--accent-emerald)" }}>
              <strong style={{ color: "var(--text-primary)" }}>PDF Specification Example:</strong> If vault starts with 100,000 USDC & 100,000 DGF ($1.00/share), a +10% gain increases TVL to 110,000 USDC. Each DGF is now worth <strong>$1.10 USDC</strong>!
            </div>
          </div>
        </div>

        {/* Right Column: Deposit & Redeem Actions */}
        <div>
          {/* User's Current Position in this Fund */}
          <div className="glass-panel" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Your {fund.symbol} Investment Position
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px" }}>
              <div>
                <div style={{ fontSize: "1.7rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                  ${userPositionValue.toFixed(2)}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                  {userFundShares.toFixed(2)} {fund.symbol} Shares
                </div>
              </div>
              {userPositionValue > 0 && (
                <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 700, background: "rgba(16, 185, 129, 0.12)", padding: "4px 8px", borderRadius: "6px" }}>
                  Active Position
                </div>
              )}
            </div>
          </div>

          {/* Deposit / Redeem Action Box */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            {/* Subtabs: Deposit vs Redeem */}
            <div className="subtabs">
              <button
                className={`subtab-btn ${activeTab === "deposit" ? "active" : ""}`}
                onClick={() => { setActiveTab("deposit"); setAmount("1000"); }}
              >
                <ArrowDownCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                <span>Deposit (Invest)</span>
              </button>
              <button
                className={`subtab-btn ${activeTab === "redeem" ? "active" : ""}`}
                onClick={() => { setActiveTab("redeem"); setAmount(userFundShares.toFixed(2)); }}
              >
                <ArrowUpCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                <span>Redeem (Exit)</span>
              </button>
            </div>

            <form onSubmit={handleAction}>
              {activeTab === "deposit" ? (
                <>
                  <div className="input-group">
                    <div className="input-label">
                      <span>Deposit Amount</span>
                      <span>
                        Wallet Balance: <strong>${balances.usdc.toFixed(2)} USDC</strong>
                      </span>
                    </div>
                    <div className="input-box">
                      <input
                        type="number"
                        step="any"
                        min="1"
                        placeholder="0.0"
                        className="input-field"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                      <span className="input-suffix">USDC</span>
                      <button
                        type="button"
                        className="input-quick-btn"
                        onClick={() => setAmount(balances.usdc.toString())}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Proportional Shares Calculation Preview */}
                  <div style={{ background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                      <span>You Deposit:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{amount || "0"} USDC</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                      <span>Current Share Price (NAV):</span>
                      <span>${fund.sharePrice.toFixed(4)} USDC</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-cyan)", borderTop: "1px solid var(--border-subtle)", paddingTop: "6px", fontWeight: 700 }}>
                      <span>Estimated {fund.symbol} Shares Received:</span>
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {amount && fund.sharePrice ? (parseFloat(amount) / fund.sharePrice).toFixed(2) : "0.00"} {fund.symbol}
                      </span>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                    <span>Confirm Deposit & Mint {fund.symbol}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <div className="input-label">
                      <span>Redeem Shares</span>
                      <span>
                        Owned Shares: <strong>{userFundShares.toFixed(2)} {fund.symbol}</strong>
                      </span>
                    </div>
                    <div className="input-box">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="0.0"
                        className="input-field"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                      <span className="input-suffix">{fund.symbol}</span>
                      <button
                        type="button"
                        className="input-quick-btn"
                        onClick={() => setAmount(userFundShares.toString())}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Return Amount Preview */}
                  <div style={{ background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                      <span>Shares Burned:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{amount || "0"} {fund.symbol}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                      <span>Current Share Price (NAV):</span>
                      <span>${fund.sharePrice.toFixed(4)} USDC</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-emerald)", borderTop: "1px solid var(--border-subtle)", paddingTop: "6px", fontWeight: 700 }}>
                      <span>USDC Asset Returned to Wallet:</span>
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        ${amount && fund.sharePrice ? (parseFloat(amount) * fund.sharePrice).toFixed(2) : "0.00"} USDC
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary btn-emerald" 
                    style={{ width: "100%" }}
                    disabled={userFundShares <= 0}
                  >
                    <span>Redeem Shares for USDC</span>
                  </button>
                </>
              )}
            </form>

            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Standardized ERC-4626 Tokenized Vault • Instant On-Chain Settlement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
