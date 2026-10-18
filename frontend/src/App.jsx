import React, { useState } from "react";
import { Web3Provider } from "./context/Web3Context";
import Navbar from "./components/Navbar";
import Toasts from "./components/Toasts";

import ExploreFundsView from "./views/ExploreFundsView";
import FundDetailView from "./views/FundDetailView";
import AMMDexView from "./views/AMMDexView";
import YieldFarmingView from "./views/YieldFarmingView";
import GovernanceView from "./views/GovernanceView";
import OracleMonitorView from "./views/OracleMonitorView";
import SecurityLabView from "./views/SecurityLabView";

export default function App() {
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedFundId, setSelectedFundId] = useState("dgf");

  const handleSelectFund = (fundId) => {
    setSelectedFundId(fundId);
    setActiveTab("vault");
  };

  return (
    <Web3Provider>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Content */}
        <main className="main-content">
          {activeTab === "explore" && (
            <ExploreFundsView onSelectFund={handleSelectFund} />
          )}

          {activeTab === "vault" && (
            <FundDetailView selectedFundId={selectedFundId} />
          )}

          {activeTab === "dex" && <AMMDexView />}

          {activeTab === "farm" && <YieldFarmingView />}

          {activeTab === "dao" && <GovernanceView />}

          {activeTab === "oracles" && <OracleMonitorView />}

          {activeTab === "security" && <SecurityLabView />}
        </main>

        {/* Global Toast Alerts */}
        <Toasts />

        {/* Footer */}
        <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "24px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", background: "rgba(7, 9, 14, 0.95)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>DMF Protocol</span>
              <span>•</span>
              <span>ERC-4626 Tokenized Mutual Funds</span>
            </div>
            <div style={{ display: "flex", gap: "16px", color: "var(--text-secondary)" }}>
              <span>Chainlink Feeds</span>
              <span>•</span>
              <span>Constant-Product AMM</span>
              <span>•</span>
              <span>Snapshot DAO</span>
              <span>•</span>
              <span>Flash-Loan Defense</span>
            </div>
            <div>
              Simulate: <span style={{ color: "var(--accent-cyan)" }}>Invest ➔ Own ➔ Govern ➔ Trade ➔ Stake ➔ Earn ➔ Redeem</span>
            </div>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
}
