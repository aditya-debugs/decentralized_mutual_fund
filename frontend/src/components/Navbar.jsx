import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { 
  TrendingUp, 
  ArrowRightLeft, 
  Sprout, 
  Vote, 
  Activity, 
  ShieldAlert, 
  Wallet, 
  Coins, 
  PlusCircle,
  Layers
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const { 
    walletMode, 
    account, 
    balances, 
    switchToSandbox, 
    connectMetaMask, 
    requestFaucetUSDC,
    isConnecting 
  } = useWeb3();

  const navItems = [
    { id: "explore", label: "Explore Funds", icon: TrendingUp },
    { id: "vault", label: "Vault Actions", icon: Layers },
    { id: "dex", label: "AMM DEX", icon: ArrowRightLeft },
    { id: "farm", label: "Yield Farm", icon: Sprout },
    { id: "dao", label: "DAO Governance", icon: Vote },
    { id: "oracles", label: "Chainlink Oracles", icon: Activity },
    { id: "security", label: "Security Lab", icon: ShieldAlert },
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand-logo" onClick={() => setActiveTab("explore")}>
          <div className="brand-icon">🌐</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="brand-title">DMF Protocol</span>
              <span className="brand-badge">ERC-4626</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Decentralized Mutual Fund Platform
            </div>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Balances & Wallet Toggle */}
        <div className="nav-actions">
          {/* Quick Faucet */}
          <button
            className="btn-secondary btn-sm"
            onClick={() => requestFaucetUSDC(1000)}
            title="Claim 1,000 Test USDC into Rahul's Wallet"
          >
            <PlusCircle size={14} color="var(--accent-cyan)" />
            <span>Faucet +1K</span>
          </button>

          {/* Quick Balance Pills */}
          <div className="wallet-box" style={{ gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem" }}>
              <Coins size={14} color="#10b981" />
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10b981" }}>
                ${balances.usdc.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>USDC</span>
            </div>

            {balances.dgf > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", borderLeft: "1px solid var(--border-subtle)", paddingLeft: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
                  {balances.dgf.toFixed(1)}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>DGF</span>
              </div>
            )}

            {balances.dmf > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", borderLeft: "1px solid var(--border-subtle)", paddingLeft: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-purple)" }}>
                  {balances.dmf.toFixed(1)}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>DMF</span>
              </div>
            )}
          </div>

          {/* Wallet Mode Badge / Switch */}
          {walletMode === "sandbox" ? (
            <button 
              className="wallet-box" 
              style={{ cursor: "pointer", background: "rgba(0, 242, 254, 0.08)", borderColor: "rgba(0, 242, 254, 0.3)" }}
              onClick={connectMetaMask}
              title="Click to switch to MetaMask Live Mode"
            >
              <span className="pulse-dot"></span>
              <span className="wallet-badge" style={{ color: "var(--accent-cyan)" }}>
                {account} (Sandbox)
              </span>
            </button>
          ) : (
            <button 
              className="wallet-box" 
              style={{ cursor: "pointer" }}
              onClick={switchToSandbox}
              title="Click to switch back to Sandbox Demo Mode"
            >
              <Wallet size={14} color="var(--accent-emerald)" />
              <span className="wallet-badge">
                {account.slice(0, 6)}...{account.slice(-4)} (Live)
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
