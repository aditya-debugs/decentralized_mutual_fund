import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  Activity, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Sliders
} from "lucide-react";

export default function OracleMonitorView() {
  const { oracles, updateOraclePrice, funds } = useWeb3();

  const [simEthPrice, setSimEthPrice] = useState(oracles.ethPrice);

  const dgfFund = funds.find((f) => f.id === "dgf") || funds[0];

  // Example from PDF: 10 ETH owned by the fund strategy
  const simulatedEthHoldings = 10;
  const simulatedEthValue = simulatedEthHoldings * oracles.ethPrice;

  const handleEthPriceChange = (newVal) => {
    setSimEthPrice(newVal);
    updateOraclePrice("ETH", newVal);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              <Activity size={14} />
              <span>Decentralized Data Feeds</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>
              Chainlink Price Oracle Live Monitor
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "4px" }}>
              Smart contracts cannot pull external web data on their own. Chainlink decentralized oracle networks provide 
              tamper-proof market price feeds to value underlying portfolio assets and calculate the real-time Net Asset Value (NAV).
            </p>
          </div>

          <div className="stat-box" style={{ minWidth: "150px" }}>
            <div className="stat-label">Feed Heartbeat</div>
            <div className="stat-value" style={{ color: "var(--accent-emerald)", fontSize: "1.2rem" }}>
              Active (100%)
            </div>
          </div>
        </div>
      </div>

      {/* Live Oracle Price Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        
        {/* ETH / USD */}
        <div className="glass-panel" style={{ padding: "24px", borderTop: "3px solid var(--accent-cyan)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)" }}>ETH / USD Feed</span>
            <span className="brand-badge">8 Decimals</span>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            ${oracles.ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
            AggregatorV3Interface • {oracles.lastUpdate}
          </div>
        </div>

        {/* BTC / USD */}
        <div className="glass-panel" style={{ padding: "24px", borderTop: "3px solid var(--accent-amber)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-amber)" }}>BTC / USD Feed</span>
            <span className="brand-badge">8 Decimals</span>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            ${oracles.btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
            AggregatorV3Interface • {oracles.lastUpdate}
          </div>
        </div>

        {/* USDC / USD */}
        <div className="glass-panel" style={{ padding: "24px", borderTop: "3px solid var(--accent-emerald)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-emerald)" }}>USDC / USD Feed</span>
            <span className="brand-badge">Pegged</span>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            ${oracles.usdcPrice.toFixed(4)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Base Settlement Currency • Stable
          </div>
        </div>
      </div>

      {/* Real-Time NAV Valuation Calculator (Matching PDF Page 4 Specification) */}
      <div className="glass-panel" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Sliders size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            Interactive Price Swing Simulator & Portfolio NAV Valuation
          </h3>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "20px" }}>
          Adjust the Chainlink ETH price slider below to observe how on-chain valuation smart contracts automatically revalue 
          the fund's underlying asset holdings (e.g. 10 ETH in DeFi Growth Fund strategy) and recalculate the share price in real time!
        </p>

        {/* Interactive Slider */}
        <div style={{ background: "rgba(0, 0, 0, 0.25)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle)", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Simulate ETH Market Price</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
              ${simEthPrice.toLocaleString()}
            </span>
          </div>

          <input
            type="range"
            min="2500"
            max="5000"
            step="50"
            value={simEthPrice}
            onChange={(e) => handleEthPriceChange(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent-cyan)", cursor: "pointer", height: "8px" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
            <span>$2,500 (Bear market)</span>
            <span>$3,500 (Baseline)</span>
            <span>$5,000 (Bull breakout)</span>
          </div>
        </div>

        {/* Math Calculation Walkthrough matching PDF Page 4 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", background: "rgba(0, 242, 254, 0.05)", border: "1px solid rgba(0, 242, 254, 0.2)", borderRadius: "12px", padding: "18px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Strategy ETH Holdings</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: "4px" }}>
              {simulatedEthHoldings} ETH
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Chainlink Oracle Price</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginTop: "4px" }}>
              ${simEthPrice.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Valuation Formula (PDF Page 4)</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: "4px" }}>
              {simulatedEthHoldings} × ${simEthPrice.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total ETH Asset Valuation</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-emerald)", marginTop: "4px" }}>
              ${(simulatedEthHoldings * simEthPrice).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
