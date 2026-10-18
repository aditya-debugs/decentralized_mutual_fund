import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("Decentralized Mutual Fund Platform - Full Suite", function () {
  let deployer, rahul, priya, attacker;
  let usdc, weth, ethPriceFeed;
  let dgfVault;
  let dmfToken;
  let dex, lpToken;
  let farm;
  let fundGov;
  let flashPool, vulnerableDAO, secureDAO, flashAttacker;

  beforeEach(async function () {
    [deployer, rahul, priya, attacker] = await ethers.getSigners();

    // 1. Deploy Mock USDC & WETH
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 18);
    weth = await MockERC20.deploy("Wrapped Ether", "WETH", 18);

    // 2. Deploy Mock Chainlink Feed (ETH = $3500)
    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    ethPriceFeed = await MockPriceFeed.deploy(8, "ETH / USD", 350000000000n);

    // 3. Deploy ERC-4626 Fund Vault (DeFi Growth Fund - DGF)
    const DecentralizedFundVault = await ethers.getContractFactory("DecentralizedFundVault");
    dgfVault = await DecentralizedFundVault.deploy(
      await usdc.getAddress(),
      "DeFi Growth Fund",
      "DGF",
      "Diversified DeFi strategy with dynamic yield optimization",
      await ethPriceFeed.getAddress()
    );

    // 4. Deploy Protocol Governance Token (DMF)
    const DMFToken = await ethers.getContractFactory("DMFToken");
    dmfToken = await DMFToken.deploy(ethers.parseEther("1000000")); // 1M initial supply

    // 5. Deploy AMM DEX for DGF ↔ USDC
    const MutualFundDEX = await ethers.getContractFactory("MutualFundDEX");
    dex = await MutualFundDEX.deploy(
      await dgfVault.getAddress(),
      await usdc.getAddress(),
      "DGF-USDC LP Token",
      "DGF-USDC-LP"
    );
    const lpTokenAddress = await dex.lpToken();
    lpToken = await ethers.getContractAt("MutualFundLPToken", lpTokenAddress);

    // 6. Deploy Yield Farming Vault (Reward rate = 1 DMF per second)
    const YieldFarmingVault = await ethers.getContractFactory("YieldFarmingVault");
    farm = await YieldFarmingVault.deploy(
      lpTokenAddress,
      await dmfToken.getAddress(),
      ethers.parseEther("1")
    );
    await dmfToken.setMinter(await farm.getAddress(), true);

    // 7. Deploy DAO Governance (Governed by DMF Token, Quorum = 100 DMF)
    const FundGovernance = await ethers.getContractFactory("FundGovernance");
    fundGov = await FundGovernance.deploy(
      await dmfToken.getAddress(),
      ethers.parseEther("100")
    );
    await dgfVault.setGovernanceDAO(await fundGov.getAddress());

    // 8. Deploy Flash Loan & Security Demo Contracts
    const FlashLoanPool = await ethers.getContractFactory("FlashLoanPool");
    flashPool = await FlashLoanPool.deploy();

    const VulnerableDAO = await ethers.getContractFactory("VulnerableDAO");
    vulnerableDAO = await VulnerableDAO.deploy(await dmfToken.getAddress());

    const SecureDAO = await ethers.getContractFactory("SecureDAO");
    secureDAO = await SecureDAO.deploy(await dmfToken.getAddress());

    const FlashLoanAttacker = await ethers.getContractFactory("FlashLoanAttacker");
    flashAttacker = await FlashLoanAttacker.deploy(await flashPool.getAddress());

    // Seed Rahul with 5,000 USDC
    await usdc.mint(rahul.address, ethers.parseEther("5000"));
    // Seed Priya with 2,000 USDC
    await usdc.mint(priya.address, ethers.parseEther("2000"));
  });

  describe("1. ERC-4626 Vault Deposits & NAV Valuation", function () {
    it("Rahul deposits 1,000 USDC and receives 1,000 DGF shares (1:1 NAV)", async function () {
      const depositAmount = ethers.parseEther("1000");
      await usdc.connect(rahul).approve(await dgfVault.getAddress(), depositAmount);
      await dgfVault.connect(rahul).deposit(depositAmount, rahul.address);

      const dgfBalance = await dgfVault.balanceOf(rahul.address);
      expect(dgfBalance).to.equal(depositAmount);

      const sharePrice = await dgfVault.getSharePrice();
      expect(sharePrice).to.equal(ethers.parseEther("1"));
    });

    it("Simulating 10% strategy yield increases share price from 1.00 to 1.10 USDC", async function () {
      // Rahul deposits 1,000 USDC
      const depositAmount = ethers.parseEther("1000");
      await usdc.connect(rahul).approve(await dgfVault.getAddress(), depositAmount);
      await dgfVault.connect(rahul).deposit(depositAmount, rahul.address);

      // Simulate 10% yield (1000 basis points)
      await dgfVault.simulateYield(1000);

      const totalAssets = await dgfVault.totalAssets();
      expect(totalAssets).to.equal(ethers.parseEther("1100"));

      const sharePrice = await dgfVault.getSharePrice();
      expect(sharePrice).to.be.closeTo(ethers.parseEther("1.1"), 10n);

      // Rahul's 1000 shares are now worth ~1100 USDC
      const rahulAssets = await dgfVault.convertToAssets(ethers.parseEther("1000"));
      expect(rahulAssets).to.be.closeTo(ethers.parseEther("1100"), 10n);
    });

    it("Rahul can redeem 1,000 DGF shares for 1,100 USDC after yield appreciation", async function () {
      const depositAmount = ethers.parseEther("1000");
      await usdc.connect(rahul).approve(await dgfVault.getAddress(), depositAmount);
      await dgfVault.connect(rahul).deposit(depositAmount, rahul.address);

      // Simulate 10% yield
      await dgfVault.simulateYield(1000);

      const initialUSDC = await usdc.balanceOf(rahul.address);
      await dgfVault.connect(rahul).redeem(ethers.parseEther("1000"), rahul.address, rahul.address);

      const finalUSDC = await usdc.balanceOf(rahul.address);
      expect(finalUSDC - initialUSDC).to.be.closeTo(ethers.parseEther("1100"), 10n);
      expect(await dgfVault.balanceOf(rahul.address)).to.equal(0n);
    });
  });

  describe("2. Secondary AMM DEX Trading & Liquidity Provision", function () {
    beforeEach(async function () {
      // Deployer deposits 10,000 USDC into vault to get 10,000 DGF
      await usdc.mint(deployer.address, ethers.parseEther("20000"));
      await usdc.approve(await dgfVault.getAddress(), ethers.parseEther("10000"));
      await dgfVault.deposit(ethers.parseEther("10000"), deployer.address);

      // Deployer adds 5,000 DGF + 5,000 USDC liquidity to AMM
      await dgfVault.approve(await dex.getAddress(), ethers.parseEther("5000"));
      await usdc.approve(await dex.getAddress(), ethers.parseEther("5000"));
      await dex.addLiquidity(ethers.parseEther("5000"), ethers.parseEther("5000"));
    });

    it("Liquidity Provider receives LP tokens upon adding liquidity", async function () {
      const lpBalance = await lpToken.balanceOf(deployer.address);
      expect(lpBalance).to.be.gt(0n);
    });

    it("Priya swaps USDC for DGF on AMM DEX", async function () {
      const swapAmountIn = ethers.parseEther("100");
      await usdc.connect(priya).approve(await dex.getAddress(), swapAmountIn);

      const expectedOut = await dex.getAmountOut(await usdc.getAddress(), swapAmountIn);
      expect(expectedOut).to.be.gt(0n);

      await dex.connect(priya).swap(await usdc.getAddress(), swapAmountIn, 0);

      const priyaDGF = await dgfVault.balanceOf(priya.address);
      expect(priyaDGF).to.equal(expectedOut);
    });

    it("Rahul can sell DGF for USDC on the AMM without vault redemption", async function () {
      // Rahul deposits into vault
      await usdc.connect(rahul).approve(await dgfVault.getAddress(), ethers.parseEther("500"));
      await dgfVault.connect(rahul).deposit(ethers.parseEther("500"), rahul.address);

      // Rahul swaps 200 DGF for USDC on AMM
      await dgfVault.connect(rahul).approve(await dex.getAddress(), ethers.parseEther("200"));
      const usdcBefore = await usdc.balanceOf(rahul.address);

      await dex.connect(rahul).swap(await dgfVault.getAddress(), ethers.parseEther("200"), 0);
      const usdcAfter = await usdc.balanceOf(rahul.address);

      expect(usdcAfter).to.be.gt(usdcBefore);
    });
  });

  describe("3. Yield Farming & LP Staking", function () {
    it("User stakes LP tokens and harvests DMF rewards over time", async function () {
      // Deployer has LP tokens
      await usdc.mint(deployer.address, ethers.parseEther("2000"));
      await usdc.approve(await dgfVault.getAddress(), ethers.parseEther("1000"));
      await dgfVault.deposit(ethers.parseEther("1000"), deployer.address);

      await dgfVault.approve(await dex.getAddress(), ethers.parseEther("1000"));
      await usdc.approve(await dex.getAddress(), ethers.parseEther("1000"));
      await dex.addLiquidity(ethers.parseEther("1000"), ethers.parseEther("1000"));

      const lpBalance = await lpToken.balanceOf(deployer.address);
      expect(lpBalance).to.be.gt(0n);

      // Stake LP into Farm
      await lpToken.approve(await farm.getAddress(), lpBalance);
      await farm.stake(lpBalance);
      expect(await farm.balanceOf(deployer.address)).to.equal(lpBalance);

      // Fast forward time by 60 seconds
      await ethers.provider.send("evm_increaseTime", [60]);
      await ethers.provider.send("evm_mine");

      const earned = await farm.earned(deployer.address);
      expect(earned).to.be.gt(0n);

      // Claim rewards
      await farm.claimRewards();
      const dmfBalance = await dmfToken.balanceOf(deployer.address);
      expect(dmfBalance).to.be.gt(0n);
    });
  });

  describe("4. DAO Governance & Portfolio Strategy Updates", function () {
    it("Token holders vote to increase ETH allocation from 30% to 40%", async function () {
      // Transfer DMF to Rahul and delegate votes
      await dmfToken.transfer(rahul.address, ethers.parseEther("500"));
      await dmfToken.connect(rahul).delegate(rahul.address);

      // Mine a block so snapshot checkpoint is recorded
      await ethers.provider.send("evm_mine");

      // Prepare target calldata for vault updateAllocation(3000, 4000, 2000, 1000)
      const iface = dgfVault.interface;
      const callData = iface.encodeFunctionData("updateAllocation", [3000, 4000, 2000, 1000]);

      // Propose update
      await fundGov.connect(rahul).createProposal(
        "Increase ETH Allocation to 40%",
        "Shift 10% from stablecoins to ETH-related assets for growth",
        await dgfVault.getAddress(),
        callData
      );

      // Rahul votes YES
      await fundGov.connect(rahul).castVote(1, true);

      // Fast forward past voting period (101 blocks)
      for (let i = 0; i < 105; i++) {
        await ethers.provider.send("evm_mine");
      }

      // Execute proposal
      await fundGov.executeProposal(1);

      // Verify vault allocation updated!
      const [stable, eth, lp, res] = await dgfVault.getAllocation();
      expect(eth).to.equal(4000n); // 40%
      expect(stable).to.equal(3000n); // 30%
    });
  });

  describe("5. DeFi Security & Flash Loan Attack Demonstration", function () {
    beforeEach(async function () {
      // Fund flash loan pool with 1,000,000 DMF tokens
      await dmfToken.transfer(await flashPool.getAddress(), ethers.parseEther("1000000"));
    });

    it("VulnerableDAO: Flash loan attacker borrows tokens and passes malicious vote in 1 tx", async function () {
      // Create malicious proposal in VulnerableDAO
      await vulnerableDAO.createProposal("Drain Treasury to Attacker", attacker.address, "0x");

      // Attacker launches flash loan attack
      await flashAttacker.launchAttack(
        await dmfToken.getAddress(),
        ethers.parseEther("500000"),
        await vulnerableDAO.getAddress(),
        1,
        true // isVulnerable
      );

      expect(await flashAttacker.attackSucceeded()).to.be.true;

      const prop = await vulnerableDAO.proposals(1);
      expect(prop.forVotes).to.equal(ethers.parseEther("500000"));
    });

    it("SecureDAO: Snapshot checkpointing blocks flash loan attack", async function () {
      // Create proposal in SecureDAO
      await secureDAO.createProposal("Drain Treasury to Attacker", attacker.address, "0x");

      // Attacker attempts the exact same flash loan against SecureDAO
      await flashAttacker.launchAttack(
        await dmfToken.getAddress(),
        ethers.parseEther("500000"),
        await secureDAO.getAddress(),
        1,
        false // isVulnerable = false (SecureDAO)
      );

      // Attack should fail because getPastVotes at snapshot block is 0!
      expect(await flashAttacker.attackSucceeded()).to.be.false;

      const prop = await secureDAO.proposals(1);
      expect(prop.forVotes).to.equal(0n);
    });
  });
});
