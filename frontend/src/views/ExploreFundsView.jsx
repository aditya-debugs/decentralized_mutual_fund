import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  ArrowUpRight, 
  Lock, 
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function ExploreFundsView({ onSelectFund }) {
  const { funds, ammPool, proposals } = useWeb3();

  const totalProtocolTVL = funds.reduce((acc, f) => acc + f.tvl, 0);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-banner">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0, 242, 254, 0.1)", border: "1px solid rgba(0, 242, 254, 0.3)", padding: "4px 12px", borderRadius: "100px", fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 700, marginBottom: "14px" }}>
          <Sparkles size={14} />
          <span>Institutional Grade Asset Management on Blockchain</span>
        </div>
        <h1 className="hero-title">
          Autonomous, Transparent & <br />
          <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Investor-Governed Mutual Funds
          </span>
        </h1>
        <p className="hero-subtitle">
          Pool assets into ERC-4626 tokenized vaults. Verify returns independently with Chainlink price feeds, 
          trade shares instantly on our built-in AMM DEX, and participate in DAO strategy governance.
        </p>

        {/* Global Stats */}
        <div className="hero-stats-row">
          <div className="stat-box">
            <div className="stat-label">Total Value Locked (TVL)</div>
            <div className="stat-value">
              ${totalProtocolTVL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">DEX 24h Volume</div>
            <div className="stat-value">
              ${ammPool.volume24h.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Active Funds</div>
            <div className="stat-value">{funds.length} Vaults</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Active DAO Proposals</div>
            <div className="stat-value">
              {proposals.filter((p) => p.status === "Active").length} Open
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: Traditional vs Decentralized Mutual Funds (PDF Page 1 Problem Statement) */}
      <div className="glass-panel" style={{ padding: "20px 24px", marginBottom: "32px", background: "linear-gradient(135deg, rgba(16, 22, 34, 0.9) 0%, rgba(12, 16, 24, 0.95) 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Architectural Shift
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "2px" }}>
              Why Decentralized Mutual Funds?
            </div>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Real-Time NAV via Chainlink Oracles</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Secondary Market AMM Liquidity</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>DAO Investor Voting on Allocations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Funds Marketplace Grid */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Curated Investment Funds</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Choose an on-chain vault strategy tailored to your risk profile.
          </p>
        </div>
      </div>

      <div className="funds-grid">
        {funds.map((fund) => {
          const isFlagship = fund.id === "dgf";
          return (
            <div
              key={fund.id}
              className="glass-panel fund-card"
              style={{
                border: isFlagship ? "1px solid rgba(0, 242, 254, 0.4)" : "1px solid var(--border-subtle)",
              }}
              onClick={() => onSelectFund(fund.id)}
            >
              {isFlagship && <div className="fund-badge-featured">Flagship Fund</div>}

              <div>
                <div className="fund-card-header">
                  <div>
                    <span className="fund-symbol">{fund.symbol}</span>
                    <h3 className="fund-name">{fund.name}</h3>
                  </div>
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "var(--accent-emerald)",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {fund.historicalPerf}
                  </div>
                </div>

                <p className="fund-desc">{fund.description}</p>

                {/* Metrics */}
                <div className="fund-metrics-table">
                  <div className="metric-row">
                    <span>Total Value Locked (TVL)</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      ${fund.tvl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USDC
                    </span>
                  </div>
                  <div className="metric-row">
                    <span>Share Price (NAV)</span>
                    <span style={{ color: "var(--accent-cyan)" }}>
                      ${fund.sharePrice.toFixed(4)} USDC
                    </span>
                  </div>
                  <div className="metric-row">
                    <span>Fund Strategy</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {fund.strategy}
                    </span>
                  </div>
                </div>

                {/* Allocation Visual Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                    <span>Target Portfolio Allocation</span>
                    <span>100%</span>
                  </div>
                  <div className="allocation-bar">
                    <div className="alloc-segment alloc-stable" style={{ width: `${fund.allocation.stable}%` }} title={`Stablecoins: ${fund.allocation.stable}%`} />
                    <div className="alloc-segment alloc-eth" style={{ width: `${fund.allocation.eth}%` }} title={`ETH-Assets: ${fund.allocation.eth}%`} />
                    <div className="alloc-segment alloc-lp" style={{ width: `${fund.allocation.lp}%` }} title={`Liquidity Pools: ${fund.allocation.lp}%`} />
                    <div className="alloc-segment alloc-res" style={{ width: `${fund.allocation.reserve}%` }} title={`Reserve: ${fund.allocation.reserve}%`} />
                  </div>
                  <div className="alloc-legend">
                    <span className="alloc-legend-item">
                      <span className="legend-dot" style={{ background: "#10b981" }}></span>
                      <span>Stable {fund.allocation.stable}%</span>
                    </span>
                    <span className="alloc-legend-item">
                      <span className="legend-dot" style={{ background: "#3b82f6" }}></span>
                      <span>ETH {fund.allocation.eth}%</span>
                    </span>
                    <span className="alloc-legend-item">
                      <span className="legend-dot" style={{ background: "#8b5cf6" }}></span>
                      <span>LP {fund.allocation.lp}%</span>
                    </span>
                    <span className="alloc-legend-item">
                      <span className="legend-dot" style={{ background: "#f59e0b" }}></span>
                      <span>Reserve {fund.allocation.reserve}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn-primary"
                style={{ width: "100%", marginTop: "16px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFund(fund.id);
                }}
              >
                <span>Invest / Manage Vault</span>
                <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
