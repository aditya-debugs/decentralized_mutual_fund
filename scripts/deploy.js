import hardhat from "hardhat";
import fs from "fs";
import path from "path";
const { ethers } = hardhat;

async function main() {
  console.log("🚀 Starting Decentralized Mutual Fund (DMF) Protocol Deployment...\n");

  const [deployer, investor1] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // 1. Deploy Mock Tokens
  console.log("\n📦 1. Deploying Mock Base Assets...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 18);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`✔ Mock USDC deployed at: ${usdcAddress}`);

  const weth = await MockERC20.deploy("Wrapped Ether", "WETH", 18);
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log(`✔ Mock WETH deployed at: ${wethAddress}`);

  const wbtc = await MockERC20.deploy("Wrapped Bitcoin", "WBTC", 18);
  await wbtc.waitForDeployment();
  const wbtcAddress = await wbtc.getAddress();
  console.log(`✔ Mock WBTC deployed at: ${wbtcAddress}`);

  // 2. Deploy Mock Chainlink Oracles
  console.log("\n🔮 2. Deploying Chainlink Price Oracles...");
  const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
  const ethFeed = await MockPriceFeed.deploy(8, "ETH / USD", 350000000000n); // $3,500.00
  await ethFeed.waitForDeployment();
  const ethFeedAddress = await ethFeed.getAddress();
  console.log(`✔ Chainlink ETH/USD Feed ($3,500) deployed at: ${ethFeedAddress}`);

  const btcFeed = await MockPriceFeed.deploy(8, "BTC / USD", 6500000000000n); // $65,000.00
  await btcFeed.waitForDeployment();
  const btcFeedAddress = await btcFeed.getAddress();
  console.log(`✔ Chainlink BTC/USD Feed ($65,000) deployed at: ${btcFeedAddress}`);

  // 3. Deploy Fund Vaults (ERC-4626)
  console.log("\n🏦 3. Deploying Decentralized Fund Vaults (ERC-4626)...");
  const DecentralizedFundVault = await ethers.getContractFactory("DecentralizedFundVault");

  // Fund 1: DeFi Growth Fund (DGF)
  const dgfVault = await DecentralizedFundVault.deploy(
    usdcAddress,
    "DeFi Growth Fund",
    "DGF",
    "Aggressive yield generation through liquid staking & top DEX liquidity pools",
    ethFeedAddress
  );
  await dgfVault.waitForDeployment();
  const dgfAddress = await dgfVault.getAddress();
  console.log(`✔ DeFi Growth Fund (DGF) Vault deployed at: ${dgfAddress}`);

  // Fund 2: Conservative Capital Fund (CCF)
  const ccfVault = await DecentralizedFundVault.deploy(
    usdcAddress,
    "Conservative Capital Fund",
    "CCF",
    "Capital preservation focusing on stablecoin lending & institutional RWA vaults",
    ethFeedAddress
  );
  await ccfVault.waitForDeployment();
  const ccfAddress = await ccfVault.getAddress();
  console.log(`✔ Conservative Capital Fund (CCF) Vault deployed at: ${ccfAddress}`);

  // Fund 3: Crypto Blue-Chip Index Fund (CBIF)
  const cbifVault = await DecentralizedFundVault.deploy(
    usdcAddress,
    "Crypto Blue-Chip Index Fund",
    "CBIF",
    "Market-cap weighted exposure to leading decentralized crypto assets",
    ethFeedAddress
  );
  await cbifVault.waitForDeployment();
  const cbifAddress = await cbifVault.getAddress();
  console.log(`✔ Crypto Blue-Chip Index Fund (CBIF) Vault deployed at: ${cbifAddress}`);

  // Fund 4: High-Yield Alpha Fund (HYAF)
  const hyafVault = await DecentralizedFundVault.deploy(
    usdcAddress,
    "High-Yield Alpha Fund",
    "HYAF",
    "Cross-chain arbitrage and algorithmic delta-neutral strategies",
    ethFeedAddress
  );
  await hyafVault.waitForDeployment();
  const hyafAddress = await hyafVault.getAddress();
  console.log(`✔ High-Yield Alpha Fund (HYAF) Vault deployed at: ${hyafAddress}`);

  // 4. Deploy Protocol Governance & Reward Token (DMF)
  console.log("\n🪙 4. Deploying Protocol Token (DMF)...");
  const DMFToken = await ethers.getContractFactory("DMFToken");
  const dmfToken = await DMFToken.deploy(ethers.parseEther("5000000")); // 5M DMF
  await dmfToken.waitForDeployment();
  const dmfAddress = await dmfToken.getAddress();
  console.log(`✔ DMF Token deployed at: ${dmfAddress}`);

  // 5. Deploy AMM DEX for DGF ↔ USDC
  console.log("\n🔄 5. Deploying Constant-Product AMM DEX...");
  const MutualFundDEX = await ethers.getContractFactory("MutualFundDEX");
  const dex = await MutualFundDEX.deploy(
    dgfAddress,
    usdcAddress,
    "DGF-USDC Liquidity Pool Token",
    "DGF-USDC-LP"
  );
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  const lpTokenAddress = await dex.lpToken();
  console.log(`✔ AMM DEX deployed at: ${dexAddress}`);
  console.log(`✔ DGF-USDC LP Token at: ${lpTokenAddress}`);

  // 6. Deploy Yield Farming Vault
  console.log("\n🌾 6. Deploying Staking & Yield Farming Vault...");
  const YieldFarmingVault = await ethers.getContractFactory("YieldFarmingVault");
  const farm = await YieldFarmingVault.deploy(
    lpTokenAddress,
    dmfAddress,
    ethers.parseEther("0.5") // 0.5 DMF per second
  );
  await farm.waitForDeployment();
  const farmAddress = await farm.getAddress();
  await dmfToken.setMinter(farmAddress, true);
  console.log(`✔ Yield Farming Vault deployed at: ${farmAddress}`);

  // 7. Deploy DAO Governance
  console.log("\n⚖️ 7. Deploying DAO Governance...");
  const FundGovernance = await ethers.getContractFactory("FundGovernance");
  const fundGov = await FundGovernance.deploy(dmfAddress, ethers.parseEther("1000"));
  await fundGov.waitForDeployment();
  const govAddress = await fundGov.getAddress();
  await dgfVault.setGovernanceDAO(govAddress);
  console.log(`✔ FundGovernance DAO deployed at: ${govAddress}`);

  // 8. Deploy Security Lab & Flash Loan Demo Contracts
  console.log("\n🛡️ 8. Deploying DeFi Security & Flash Loan Demo...");
  const FlashLoanPool = await ethers.getContractFactory("FlashLoanPool");
  const flashPool = await FlashLoanPool.deploy();
  await flashPool.waitForDeployment();
  const flashPoolAddress = await flashPool.getAddress();

  const VulnerableDAO = await ethers.getContractFactory("VulnerableDAO");
  const vulnerableDAO = await VulnerableDAO.deploy(dmfAddress);
  await vulnerableDAO.waitForDeployment();
  const vulnerableDAOAddress = await vulnerableDAO.getAddress();

  const SecureDAO = await ethers.getContractFactory("SecureDAO");
  const secureDAO = await SecureDAO.deploy(dmfAddress);
  await secureDAO.waitForDeployment();
  const secureDAOAddress = await secureDAO.getAddress();

  const FlashLoanAttacker = await ethers.getContractFactory("FlashLoanAttacker");
  const flashAttacker = await FlashLoanAttacker.deploy(flashPoolAddress);
  await flashAttacker.waitForDeployment();
  const attackerAddress = await flashAttacker.getAddress();

  console.log(`✔ FlashLoanPool at: ${flashPoolAddress}`);
  console.log(`✔ VulnerableDAO at: ${vulnerableDAOAddress}`);
  console.log(`✔ SecureDAO at: ${secureDAOAddress}`);
  console.log(`✔ FlashLoanAttacker at: ${attackerAddress}`);

  // 9. Initial Liquidity & Seed Data (Page 1-6 specs)
  console.log("\n🌱 9. Seeding Initial Protocol Liquidity & Vault TVL...");
  // Mint 500,000 USDC to deployer
  await usdc.mint(deployer.address, ethers.parseEther("500000"));

  // Fund DGF Vault with 100,000 USDC (Matching Page 1 specification: 100,000 USDC = 100,000 DGF)
  await usdc.approve(dgfAddress, ethers.parseEther("100000"));
  await dgfVault.deposit(ethers.parseEther("100000"), deployer.address);
  console.log("✔ DGF Vault seeded with 100,000 USDC (100,000 DGF shares minted)");

  // Fund CCF Vault with 50,000 USDC
  await usdc.approve(ccfAddress, ethers.parseEther("50000"));
  await ccfVault.deposit(ethers.parseEther("50000"), deployer.address);

  // Fund CBIF Vault with 75,000 USDC
  await usdc.approve(cbifAddress, ethers.parseEther("75000"));
  await cbifVault.deposit(ethers.parseEther("75000"), deployer.address);

  // Fund AMM DEX with 10,000 DGF + 10,000 USDC
  await dgfVault.approve(dexAddress, ethers.parseEther("10000"));
  await usdc.approve(dexAddress, ethers.parseEther("10000"));
  await dex.addLiquidity(ethers.parseEther("10000"), ethers.parseEther("10000"));
  console.log("✔ AMM DEX pool seeded with 10,000 DGF + 10,000 USDC liquidity");

  // Fund Flash Loan Pool with 1,000,000 DMF
  await dmfToken.transfer(flashPoolAddress, ethers.parseEther("1000000"));
  console.log("✔ Flash Loan Pool seeded with 1,000,000 DMF tokens");

  // Seed sample DAO Proposal: "Increase allocation to ETH-related assets from 30% to 40%"
  await dmfToken.delegate(deployer.address);
  const iface = dgfVault.interface;
  const calldata = iface.encodeFunctionData("updateAllocation", [3000, 4000, 2000, 1000]);
  await fundGov.createProposal(
    "Increase allocation to ETH-related assets from 30% to 40%",
    "Rebalance portfolio weights to capture anticipated layer-1 network expansion while maintaining 30% stablecoin reserve.",
    dgfAddress,
    calldata
  );
  console.log("✔ DAO Proposal #1 created: 'Increase allocation to ETH-related assets from 30% to 40%'");

  // Seed demo attack proposal in VulnerableDAO and SecureDAO
  await vulnerableDAO.createProposal("Emergency Exploit: Drain Protocol Treasury", attackerAddress, "0x");
  await secureDAO.createProposal("Emergency Exploit: Drain Protocol Treasury", attackerAddress, "0x");

  // Export contract addresses and ABIs for Frontend
  const deployedContractsData = {
    network: "localhost",
    chainId: 31337,
    contracts: {
      USDC: { address: usdcAddress },
      WETH: { address: wethAddress },
      WBTC: { address: wbtcAddress },
      ETHPriceFeed: { address: ethFeedAddress },
      BTCPriceFeed: { address: btcFeedAddress },
      DGFVault: { address: dgfAddress },
      CCFVault: { address: ccfAddress },
      CBIFVault: { address: cbifAddress },
      HYAFVault: { address: hyafAddress },
      DMFToken: { address: dmfAddress },
      MutualFundDEX: { address: dexAddress },
      LPToken: { address: lpTokenAddress },
      YieldFarmingVault: { address: farmAddress },
      FundGovernance: { address: govAddress },
      FlashLoanPool: { address: flashPoolAddress },
      VulnerableDAO: { address: vulnerableDAOAddress },
      SecureDAO: { address: secureDAOAddress },
      FlashLoanAttacker: { address: attackerAddress },
    },
  };

  const outputDir = path.resolve("./frontend/src/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployedContracts.json"),
    JSON.stringify(deployedContractsData, null, 2)
  );

  console.log("\n💾 Deployed contract addresses exported to frontend/src/contracts/deployedContracts.json");
  console.log("🎉 Complete DMF Protocol Deployment Finished Successfully!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
