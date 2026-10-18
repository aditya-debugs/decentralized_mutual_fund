import fs from "fs";
import path from "path";

const contractsToExport = [
  { name: "DecentralizedFundVault", file: "core/DecentralizedFundVault.sol/DecentralizedFundVault.json" },
  { name: "MockERC20", file: "mocks/MockERC20.sol/MockERC20.json" },
  { name: "MockPriceFeed", file: "oracles/MockPriceFeed.sol/MockPriceFeed.json" },
  { name: "DMFToken", file: "core/DMFToken.sol/DMFToken.json" },
  { name: "MutualFundDEX", file: "dex/MutualFundDEX.sol/MutualFundDEX.json" },
  { name: "MutualFundLPToken", file: "dex/MutualFundLPToken.sol/MutualFundLPToken.json" },
  { name: "YieldFarmingVault", file: "staking/YieldFarmingVault.sol/YieldFarmingVault.json" },
  { name: "FundGovernance", file: "governance/FundGovernance.sol/FundGovernance.json" },
  { name: "FlashLoanPool", file: "security-demo/FlashLoanPool.sol/FlashLoanPool.json" },
  { name: "VulnerableDAO", file: "security-demo/VulnerableDAO.sol/VulnerableDAO.json" },
  { name: "SecureDAO", file: "security-demo/SecureDAO.sol/SecureDAO.json" },
  { name: "FlashLoanAttacker", file: "security-demo/FlashLoanAttacker.sol/FlashLoanAttacker.json" },
];

const artifactsDir = path.resolve("./artifacts/contracts");
const outDir = path.resolve("./frontend/src/contracts");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const allAbis = {};

for (const c of contractsToExport) {
  const fullPath = path.join(artifactsDir, c.file);
  if (fs.existsSync(fullPath)) {
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    allAbis[c.name] = data.abi;
    console.log(`Exported ABI: ${c.name}`);
  } else {
    console.warn(`Artifact not found: ${fullPath}`);
  }
}

fs.writeFileSync(path.join(outDir, "abis.json"), JSON.stringify(allAbis, null, 2));
console.log("All ABIs successfully exported to frontend/src/contracts/abis.json");
