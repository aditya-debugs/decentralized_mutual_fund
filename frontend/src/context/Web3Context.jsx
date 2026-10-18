import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import deployedContracts from "../contracts/deployedContracts.json";
import abis from "../contracts/abis.json";
import confetti from "canvas-confetti";

const Web3Context = createContext();

export function Web3Provider({ children }) {
  // Modes: 'sandbox' (demo mode with Rahul's 5000 USDC wallet) or 'live' (MetaMask)
  const [walletMode, setWalletMode] = useState("sandbox");
  const [account, setAccount] = useState("0x71C...Rahul");
  const [chainId, setChainId] = useState(31337);
  const [isConnecting, setIsConnecting] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Live Wallet balances & Protocol State (Sandbox Defaults matching PDF specs)
  const [balances, setBalances] = useState({
    usdc: 5000.0, // Rahul starts with 5,000 USDC (PDF page 2 & 7)
    dgf: 0.0,     // DGF share balance
    ccf: 0.0,     // CCF share balance
    cbif: 0.0,    // CBIF share balance
    hyaf: 0.0,    // HYAF share balance
    dmf: 250.0,   // DMF governance tokens
    lpTokens: 0.0,// DGF-USDC LP tokens
    stakedLP: 0.0,// Staked in yield farm
    pendingDMF: 0.0, // Farm rewards
  });

  // Fund Vaults Data
  const [funds, setFunds] = useState([
    {
      id: "dgf",
      name: "DeFi Growth Fund",
      symbol: "DGF",
      tag: "Flagship",
      tvl: 100000.0,
      shares: 100000.0,
      sharePrice: 1.0,
      historicalPerf: "+8.4%",
      strategy: "DeFi Assets & Yield Optimization",
      allocation: { stable: 40, eth: 30, lp: 20, reserve: 10 },
      description: "Aggressive yield generation through liquid staking, lending markets & top DEX liquidity pools.",
    },
    {
      id: "ccf",
      name: "Conservative Capital Fund",
      symbol: "CCF",
      tag: "Low Risk",
      tvl: 50000.0,
      shares: 50000.0,
      sharePrice: 1.0,
      historicalPerf: "+4.2%",
      strategy: "Stablecoin Lending & Institutional RWAs",
      allocation: { stable: 85, eth: 5, lp: 0, reserve: 10 },
      description: "Capital preservation focused on over-collateralized stablecoin lending and short-term US Treasury yields.",
    },
    {
      id: "cbif",
      name: "Crypto Blue-Chip Index",
      symbol: "CBIF",
      tag: "Index",
      tvl: 75000.0,
      shares: 75000.0,
      sharePrice: 1.0,
      historicalPerf: "+14.6%",
      strategy: "Top Market Cap Assets",
      allocation: { stable: 10, eth: 45, lp: 35, reserve: 10 },
      description: "Automated market-cap weighted exposure to leading layer-1 networks and core DeFi protocols.",
    },
    {
      id: "hyaf",
      name: "High-Yield Alpha Fund",
      symbol: "HYAF",
      tag: "High APY",
      tvl: 30000.0,
      shares: 30000.0,
      sharePrice: 1.0,
      historicalPerf: "+22.1%",
      strategy: "Arbitrage & Delta-Neutral Strategies",
      allocation: { stable: 20, eth: 20, lp: 50, reserve: 10 },
      description: "Algorithmic delta-neutral market making and multi-chain yield capture with automated risk hedging.",
    },
  ]);

  // AMM DEX Pool State
  const [ammPool, setAmmPool] = useState({
    reserveDGF: 10000.0,
    reserveUSDC: 10000.0,
    totalLP: 10000.0,
    feeRate: 0.003, // 0.3%
    volume24h: 38450.0,
  });

  // Chainlink Oracle Feeds
  const [oracles, setOracles] = useState({
    ethPrice: 3500.0,
    btcPrice: 65000.0,
    usdcPrice: 1.0,
    lastUpdate: "Just now",
  });

  // DAO Proposals State
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: "Increase allocation to ETH-related assets from 30% to 40%",
      description: "Rebalance portfolio weights from 40% stablecoins / 30% ETH to 30% stablecoins / 40% ETH to capture layer-1 network appreciation.",
      targetFund: "DGF",
      forVotes: 8500,
      againstVotes: 1200,
      quorum: 10000,
      votingEndsIn: "24 Blocks (~5 mins)",
      status: "Active",
      hasVoted: false,
    },
    {
      id: 2,
      title: "Integrate Real-World Asset (RWA) Yield Adapter",
      description: "Deploy 15% of Conservative Capital Fund treasury into tokenized short-term US Treasury Bills.",
      targetFund: "CCF",
      forVotes: 12400,
      againstVotes: 400,
      quorum: 10000,
      votingEndsIn: "Executed",
      status: "Passed",
      hasVoted: true,
    },
  ]);

  // Toast Notification helper
  const notify = (title, message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#00f2fe", "#4facfe", "#10b981"],
      });
    } catch (e) {}
  };

  // Continuous Farm Reward Accumulator (ticking every 1s when LP staked)
  useEffect(() => {
    if (balances.stakedLP <= 0) return;
    const interval = setInterval(() => {
      setBalances((prev) => {
        // 0.05 DMF per staked LP token per second
        const reward = prev.stakedLP * 0.02;
        return { ...prev, pendingDMF: prev.pendingDMF + reward };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [balances.stakedLP]);

  // Connect MetaMask (Live Mode)
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      notify("MetaMask Not Detected", "Switched to Interactive Sandbox Demo Mode.", "info");
      setWalletMode("sandbox");
      return;
    }
    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setWalletMode("live");
      notify("Wallet Connected", `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    } catch (err) {
      notify("Connection Failed", err.message, "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSandbox = () => {
    setWalletMode("sandbox");
    setAccount("0x71C...Rahul");
    notify("Sandbox Activated", "Pre-funded with 5,000 USDC. All interactions are live in-memory!");
  };

  // Faucet
  const requestFaucetUSDC = (amount = 1000) => {
    setBalances((prev) => ({ ...prev, usdc: prev.usdc + amount }));
    notify("Faucet Credited", `Received +${amount} USDC!`, "success");
    fireCelebration();
  };

  // ==========================================
  // 1. ERC-4626 Fund Vault: Deposit
  // ==========================================
  const depositIntoVault = (fundId, usdcAmount) => {
    if (balances.usdc < usdcAmount) {
      notify("Insufficient Balance", `You only have ${balances.usdc.toFixed(2)} USDC`, "error");
      return false;
    }

    const targetFund = funds.find((f) => f.id === fundId);
    if (!targetFund) return false;

    // Shares = amount / sharePrice
    const sharesToMint = usdcAmount / targetFund.sharePrice;

    // Update balances
    setBalances((prev) => ({
      ...prev,
      usdc: prev.usdc - usdcAmount,
      [fundId]: (prev[fundId] || 0) + sharesToMint,
    }));

    // Update fund vault TVL and shares
    setFunds((prev) =>
      prev.map((f) => {
        if (f.id === fundId) {
          return {
            ...f,
            tvl: f.tvl + usdcAmount,
            shares: f.shares + sharesToMint,
          };
        }
        return f;
      })
    );

    notify(
      "Deposit Confirmed",
      `Deposited ${usdcAmount} USDC ➔ Received ${sharesToMint.toFixed(2)} ${targetFund.symbol} Shares`,
      "success"
    );
    fireCelebration();
    return true;
  };

  // ==========================================
  // 2. ERC-4626 Fund Vault: Redeem
  // ==========================================
  const redeemFromVault = (fundId, shareAmount) => {
    const currentShares = balances[fundId] || 0;
    if (currentShares < shareAmount) {
      notify("Insufficient Shares", `You only own ${currentShares.toFixed(2)} shares`, "error");
      return false;
    }

    const targetFund = funds.find((f) => f.id === fundId);
    if (!targetFund) return false;

    const usdcToReturn = shareAmount * targetFund.sharePrice;

    setBalances((prev) => ({
      ...prev,
      [fundId]: prev[fundId] - shareAmount,
      usdc: prev.usdc + usdcToReturn,
    }));

    setFunds((prev) =>
      prev.map((f) => {
        if (f.id === fundId) {
          return {
            ...f,
            tvl: Math.max(0, f.tvl - usdcToReturn),
            shares: Math.max(0, f.shares - shareAmount),
          };
        }
        return f;
      })
    );

    notify(
      "Redemption Successful",
      `Burned ${shareAmount.toFixed(2)} ${targetFund.symbol} ➔ Received ${usdcToReturn.toFixed(2)} USDC`,
      "success"
    );
    fireCelebration();
    return true;
  };

  // ==========================================
  // 3. Simulate Strategy Yield (Page 4-5 in PDF)
  // ==========================================
  const simulateYieldGain = (fundId = "dgf", percentageGain = 10) => {
    setFunds((prev) =>
      prev.map((f) => {
        if (f.id === fundId) {
          const gainRatio = 1 + percentageGain / 100;
          const newTvl = f.tvl * gainRatio;
          const newSharePrice = f.shares > 0 ? newTvl / f.shares : f.sharePrice;
          return {
            ...f,
            tvl: newTvl,
            sharePrice: parseFloat(newSharePrice.toFixed(4)),
            historicalPerf: `+${(parseFloat(f.historicalPerf) + percentageGain).toFixed(1)}%`,
          };
        }
        return f;
      })
    );

    notify(
      `Strategy Yield Accrued (+${percentageGain}%)`,
      `Fund TVL gained +${percentageGain}%. Share price appreciated from $1.00 ➔ $1.10!`,
      "success"
    );
    fireCelebration();
  };

  // ==========================================
  // 4. AMM DEX: Swap (DGF ↔ USDC)
  // ==========================================
  const swapTokens = (fromToken, toToken, amountIn) => {
    const isFromUSDC = fromToken === "USDC";
    const balanceToCheck = isFromUSDC ? balances.usdc : balances.dgf;

    if (balanceToCheck < amountIn) {
      notify("Insufficient Balance", `You don't have enough ${fromToken}`, "error");
      return false;
    }

    const { reserveDGF, reserveUSDC, feeRate } = ammPool;
    const inReserve = isFromUSDC ? reserveUSDC : reserveDGF;
    const outReserve = isFromUSDC ? reserveDGF : reserveUSDC;

    // Constant product formula with 0.3% fee: Δy = (y * Δx * 0.997) / (x + Δx * 0.997)
    const amountInWithFee = amountIn * (1 - feeRate);
    const amountOut = (outReserve * amountInWithFee) / (inReserve + amountInWithFee);

    // Update pool reserves
    const newReserveDGF = isFromUSDC ? reserveDGF - amountOut : reserveDGF + amountIn;
    const newReserveUSDC = isFromUSDC ? reserveUSDC + amountIn : reserveUSDC - amountOut;

    setAmmPool((prev) => ({
      ...prev,
      reserveDGF: newReserveDGF,
      reserveUSDC: newReserveUSDC,
      volume24h: prev.volume24h + amountIn,
    }));

    // Update balances
    setBalances((prev) => ({
      ...prev,
      [isFromUSDC ? "usdc" : "dgf"]: prev[isFromUSDC ? "usdc" : "dgf"] - amountIn,
      [isFromUSDC ? "dgf" : "usdc"]: prev[isFromUSDC ? "dgf" : "usdc"] + amountOut,
    }));

    notify(
      "AMM Swap Executed",
      `Swapped ${amountIn.toFixed(2)} ${fromToken} ➔ Received ${amountOut.toFixed(2)} ${toToken}`,
      "success"
    );
    fireCelebration();
    return true;
  };

  // ==========================================
  // 5. AMM DEX: Add Liquidity (DGF + USDC)
  // ==========================================
  const addLiquidityToPool = (dgfAmount, usdcAmount) => {
    if (balances.dgf < dgfAmount || balances.usdc < usdcAmount) {
      notify("Insufficient Balances", "You need both DGF and USDC to add liquidity", "error");
      return false;
    }

    const mintedLP = Math.min(
      (dgfAmount * ammPool.totalLP) / ammPool.reserveDGF,
      (usdcAmount * ammPool.totalLP) / ammPool.reserveUSDC
    );

    setAmmPool((prev) => ({
      ...prev,
      reserveDGF: prev.reserveDGF + dgfAmount,
      reserveUSDC: prev.reserveUSDC + usdcAmount,
      totalLP: prev.totalLP + mintedLP,
    }));

    setBalances((prev) => ({
      ...prev,
      dgf: prev.dgf - dgfAmount,
      usdc: prev.usdc - usdcAmount,
      lpTokens: prev.lpTokens + mintedLP,
    }));

    notify(
      "Liquidity Added",
      `Deposited ${dgfAmount} DGF + ${usdcAmount} USDC ➔ Minted ${mintedLP.toFixed(2)} LP Tokens`,
      "success"
    );
    fireCelebration();
    return true;
  };

  // ==========================================
  // 6. Yield Farming: Stake & Harvest
  // ==========================================
  const stakeLP = (amount) => {
    if (balances.lpTokens < amount) {
      notify("Insufficient LP", `You only have ${balances.lpTokens.toFixed(2)} LP tokens`, "error");
      return false;
    }

    setBalances((prev) => ({
      ...prev,
      lpTokens: prev.lpTokens - amount,
      stakedLP: prev.stakedLP + amount,
    }));

    notify("Staked in Farm", `Staked ${amount.toFixed(2)} DGF-USDC LP tokens to earn DMF rewards!`, "success");
    return true;
  };

  const unstakeLP = (amount) => {
    if (balances.stakedLP < amount) {
      notify("Insufficient Staked LP", `You only have ${balances.stakedLP.toFixed(2)} staked LP`, "error");
      return false;
    }

    setBalances((prev) => ({
      ...prev,
      stakedLP: prev.stakedLP - amount,
      lpTokens: prev.lpTokens + amount,
    }));

    notify("Unstaked LP", `Unstaked ${amount.toFixed(2)} LP tokens returned to wallet`, "success");
    return true;
  };

  const claimFarmRewards = () => {
    const claimable = balances.pendingDMF;
    if (claimable <= 0) {
      notify("No Rewards", "No rewards to harvest yet. Wait a few moments!", "info");
      return;
    }

    setBalances((prev) => ({
      ...prev,
      dmf: prev.dmf + claimable,
      pendingDMF: 0,
    }));

    notify("Harvested Rewards", `Claimed +${claimable.toFixed(2)} DMF Protocol Tokens!`, "success");
    fireCelebration();
  };

  // ==========================================
  // 7. DAO Governance: Vote & Execute
  // ==========================================
  const voteOnProposal = (proposalId, support) => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop || prop.hasVoted) {
      notify("Already Voted", "You have already cast your vote on this proposal", "error");
      return;
    }

    const voterWeight = balances.dmf > 0 ? balances.dmf : 500; // use DMF voting power

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const newFor = support ? p.forVotes + voterWeight : p.forVotes;
          const newAgainst = !support ? p.againstVotes + voterWeight : p.againstVotes;
          return {
            ...p,
            forVotes: newFor,
            againstVotes: newAgainst,
            hasVoted: true,
          };
        }
        return p;
      })
    );

    notify(
      "Vote Cast",
      `Voted ${support ? "YES (Approve)" : "NO (Reject)"} with ${voterWeight.toFixed(0)} DMF voting weight!`,
      "success"
    );
  };

  const executeProposal = (proposalId) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return { ...p, status: "Executed" };
        }
        return p;
      })
    );

    // Apply allocation update if proposal 1
    if (proposalId === 1) {
      setFunds((prev) =>
        prev.map((f) => {
          if (f.id === "dgf") {
            return {
              ...f,
              allocation: { stable: 30, eth: 40, lp: 20, reserve: 10 },
            };
          }
          return f;
        })
      );
    }

    notify("Proposal Executed", "DAO strategy allocation successfully applied on-chain!", "success");
    fireCelebration();
  };

  // ==========================================
  // 8. Chainlink Price Feeds Update
  // ==========================================
  const updateOraclePrice = (asset, newPrice) => {
    setOracles((prev) => ({
      ...prev,
      [asset === "ETH" ? "ethPrice" : "btcPrice"]: newPrice,
      lastUpdate: "Just updated",
    }));

    notify("Chainlink Feed Updated", `${asset} / USD price updated to $${newPrice.toLocaleString()}`, "info");
  };

  return (
    <Web3Context.Provider
      value={{
        walletMode,
        account,
        chainId,
        isConnecting,
        balances,
        funds,
        ammPool,
        oracles,
        proposals,
        toasts,
        connectMetaMask,
        switchToSandbox,
        requestFaucetUSDC,
        depositIntoVault,
        redeemFromVault,
        simulateYieldGain,
        swapTokens,
        addLiquidityToPool,
        stakeLP,
        unstakeLP,
        claimFarmRewards,
        voteOnProposal,
        executeProposal,
        updateOraclePrice,
        notify,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
