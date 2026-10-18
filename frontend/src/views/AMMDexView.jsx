import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  ArrowRightLeft, 
  Droplets, 
  Percent, 
  Activity, 
  HelpCircle, 
  Info,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function AMMDexView() {
  const { ammPool, balances, swapTokens, addLiquidityToPool } = useWeb3();

  const [activeTab, setActiveTab] = useState("swap"); // 'swap' | 'pool'
  const [fromToken, setFromToken] = useState("USDC");
  const [swapAmountIn, setSwapAmountIn] = useState("100");

  const [addDgfAmount, setAddDgfAmount] = useState("100");
  const [addUsdcAmount, setAddUsdcAmount] = useState("100");

  const toToken = fromToken === "USDC" ? "DGF" : "USDC";

  // Calculate swap preview
  const parsedIn = parseFloat(swapAmountIn) || 0;
  const inReserve = fromToken === "USDC" ? ammPool.reserveUSDC : ammPool.reserveDGF;
  const outReserve = fromToken === "USDC" ? ammPool.reserveDGF : ammPool.reserveUSDC;

  const inWithFee = parsedIn * (1 - ammPool.feeRate);
  const calculatedOut = inReserve > 0 ? (outReserve * inWithFee) / (inReserve + inWithFee) : 0;
  const executionPrice = parsedIn > 0 ? calculatedOut / parsedIn : 1.0;

  const handleSwap = (e) => {
    e.preventDefault();
    if (parsedIn <= 0) return;
    const ok = swapTokens(fromToken, toToken, parsedIn);
    if (ok) setSwapAmountIn("");
  };

  const handleAddLiquidity = (e) => {
    e.preventDefault();
    const dgfVal = parseFloat(addDgfAmount);
    const usdcVal = parseFloat(addUsdcAmount);
    if (!dgfVal || !usdcVal || dgfVal <= 0 || usdcVal <= 0) return;
    const ok = addLiquidityToPool(dgfVal, usdcVal);
    if (ok) {
      setAddDgfAmount("");
      setAddUsdcAmount("");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              <ArrowRightLeft size={14} />
              <span>Secondary Market Infrastructure</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>
              Mutual Fund AMM Decentralized Exchange
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "4px" }}>
              In traditional finance, exiting a mutual fund requires waiting for the fund house to redeem units. 
              Here, investors can instantly trade fund shares (DGF ↔ USDC) via an automated constant-product AMM, 
              or supply liquidity to earn trading fees!
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div className="stat-box" style={{ minWidth: "140px" }}>
              <div className="stat-label">Pool APY</div>
              <div className="stat-value" style={{ color: "var(--accent-emerald)" }}>18.4%</div>
            </div>
            <div className="stat-box" style={{ minWidth: "140px" }}>
              <div className="stat-label">Total Pool Depth</div>
              <div className="stat-value">
                ${(ammPool.reserveUSDC * 2).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column: Interactive Swap / Pool Card */}
        <div className="glass-panel" style={{ padding: "28px" }}>
          <div className="subtabs">
            <button
              className={`subtab-btn ${activeTab === "swap" ? "active" : ""}`}
              onClick={() => setActiveTab("swap")}
            >
              <ArrowRightLeft size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              <span>Swap Fund Shares</span>
            </button>
            <button
              className={`subtab-btn ${activeTab === "pool" ? "active" : ""}`}
              onClick={() => setActiveTab("pool")}
            >
              <Droplets size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              <span>Supply Liquidity & Earn</span>
            </button>
          </div>

          {activeTab === "swap" ? (
            <form onSubmit={handleSwap}>
              {/* Token In */}
              <div className="input-group">
                <div className="input-label">
                  <span>You Pay</span>
                  <span>
                    Balance: <strong>{fromToken === "USDC" ? balances.usdc.toFixed(2) : balances.dgf.toFixed(2)} {fromToken}</strong>
                  </span>
                </div>
                <div className="input-box">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="0.0"
                    className="input-field"
                    value={swapAmountIn}
                    onChange={(e) => setSwapAmountIn(e.target.value)}
                    required
                  />
                  <span className="input-suffix">{fromToken}</span>
                </div>
              </div>

              {/* Flip Button */}
              <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0 10px" }}>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  style={{ borderRadius: "50%", width: "36px", height: "36px", padding: 0 }}
                  onClick={() => setFromToken(toToken)}
                  title="Invert swap direction"
                >
                  <ArrowRightLeft size={16} />
                </button>
              </div>

              {/* Token Out */}
              <div className="input-group">
                <div className="input-label">
                  <span>You Receive (Estimated)</span>
                  <span>
                    Balance: <strong>{toToken === "USDC" ? balances.usdc.toFixed(2) : balances.dgf.toFixed(2)} {toToken}</strong>
                  </span>
                </div>
                <div className="input-box" style={{ background: "rgba(0, 0, 0, 0.4)" }}>
                  <input
                    type="text"
                    readOnly
                    className="input-field"
                    value={calculatedOut > 0 ? calculatedOut.toFixed(4) : "0.00"}
                    style={{ color: "var(--accent-cyan)" }}
                  />
                  <span className="input-suffix">{toToken}</span>
                </div>
              </div>

              {/* Swap Details */}
              <div style={{ background: "rgba(0, 0, 0, 0.25)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>Exchange Rate:</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    1 {fromToken} ≈ {executionPrice.toFixed(4)} {toToken}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>LP Trading Fee (0.3%):</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {(parsedIn * 0.003).toFixed(4)} {fromToken}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>AMM Formula:</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-purple)" }}>
                    Constant Product (x · y = k)
                  </span>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                <span>Swap {fromToken} for {toToken}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddLiquidity}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "16px" }}>
                Deposit equal values of DGF and USDC to become a liquidity provider. You'll receive LP tokens and earn a 0.3% cut of every trade!
              </p>

              <div className="input-group">
                <div className="input-label">
                  <span>DGF Token Amount</span>
                  <span>Owned: <strong>{balances.dgf.toFixed(2)} DGF</strong></span>
                </div>
                <div className="input-box">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="0.0"
                    className="input-field"
                    value={addDgfAmount}
                    onChange={(e) => setAddDgfAmount(e.target.value)}
                    required
                  />
                  <span className="input-suffix">DGF</span>
                </div>
              </div>

              <div className="input-group">
                <div className="input-label">
                  <span>USDC Amount</span>
                  <span>Owned: <strong>${balances.usdc.toFixed(2)} USDC</strong></span>
                </div>
                <div className="input-box">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="0.0"
                    className="input-field"
                    value={addUsdcAmount}
                    onChange={(e) => setAddUsdcAmount(e.target.value)}
                    required
                  />
                  <span className="input-suffix">USDC</span>
                </div>
              </div>

              <button type="submit" className="btn-primary btn-emerald" style={{ width: "100%", marginTop: "8px" }}>
                <span>Supply Liquidity & Mint LP Tokens</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Pool Reserves & User LP Position */}
        <div>
          {/* User's LP Position */}
          <div className="glass-panel" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Your Liquidity Position
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px" }}>
              <div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                  {balances.lpTokens.toFixed(2)} LP
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  DGF-USDC Liquidity Provider Tokens
                </div>
              </div>
              <span className="brand-badge">Earn 0.3% Fees</span>
            </div>
          </div>

          {/* AMM Pool Reserves */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>
              DGF / USDC Pool Reserves
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(0, 0, 0, 0.25)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>DGF Reserves</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                  {ammPool.reserveDGF.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} DGF
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>USDC Reserves</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                  ${ammPool.reserveUSDC.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} USDC
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Total Pool LP Supply</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
                  {ammPool.totalLP.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} LP
                </span>
              </div>
            </div>

            {/* Explanatory callout directly from PDF section 9 & 10 */}
            <div style={{ marginTop: "16px", padding: "12px 14px", background: "rgba(139, 92, 246, 0.08)", borderRadius: "8px", fontSize: "0.82rem", color: "var(--text-secondary)", borderLeft: "3px solid var(--accent-purple)", lineHeight: "1.5" }}>
              <strong style={{ color: "var(--text-primary)" }}>DeFi Innovation:</strong> While traditional mutual fund units are locked with the fund manager, tokenized shares can be freely swapped in secondary liquidity pools. LPs capture fees on every transaction!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
