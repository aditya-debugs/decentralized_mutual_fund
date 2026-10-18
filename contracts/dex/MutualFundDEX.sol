// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./MutualFundLPToken.sol";

/**
 * @title MutualFundDEX
 * @notice Constant-Product AMM (x * y = k) for secondary market trading of fund shares (e.g., DGF ↔ USDC).
 * Allows investors to enter/exit positions without directly minting/redeeming from the vault.
 * Distributes a 0.3% trading fee to Liquidity Providers.
 */
contract MutualFundDEX is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenA; // Fund Token (e.g. DGF)
    IERC20 public immutable tokenB; // Base Asset (e.g. USDC)
    MutualFundLPToken public immutable lpToken;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant FEE_NUMERATOR = 997; // 0.3% fee (3/1000)

    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 lpMinted
    );
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 lpBurned
    );
    event Swap(
        address indexed sender,
        address indexed tokenIn,
        uint256 amountIn,
        address indexed tokenOut,
        uint256 amountOut
    );

    constructor(
        address tokenA_,
        address tokenB_,
        string memory lpName,
        string memory lpSymbol
    ) {
        require(tokenA_ != tokenB_, "DEX: Identical tokens");
        tokenA = IERC20(tokenA_);
        tokenB = IERC20(tokenB_);
        lpToken = new MutualFundLPToken(lpName, lpSymbol);
    }

    /**
     * @notice Add liquidity to the DGF / USDC pool
     */
    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256 lpMinted) {
        require(amountA > 0 && amountB > 0, "DEX: Invalid amounts");

        uint256 totalLP = lpToken.totalSupply();

        if (totalLP == 0) {
            lpMinted = Math.sqrt(amountA * amountB);
        } else {
            uint256 lpA = (amountA * totalLP) / reserveA;
            uint256 lpB = (amountB * totalLP) / reserveB;
            lpMinted = Math.min(lpA, lpB);
        }

        require(lpMinted > 0, "DEX: Insufficient LP minted");

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;

        lpToken.mint(msg.sender, lpMinted);

        emit LiquidityAdded(msg.sender, amountA, amountB, lpMinted);
    }

    /**
     * @notice Remove liquidity from the pool and receive tokenA + tokenB
     */
    function removeLiquidity(
        uint256 lpAmount
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(lpAmount > 0, "DEX: Zero LP amount");
        uint256 totalLP = lpToken.totalSupply();
        require(totalLP > 0, "DEX: No liquidity in pool");

        amountA = (lpAmount * reserveA) / totalLP;
        amountB = (lpAmount * reserveB) / totalLP;

        require(amountA > 0 && amountB > 0, "DEX: Insufficient amounts returned");

        lpToken.burn(msg.sender, lpAmount);

        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, lpAmount);
    }

    /**
     * @notice Swap tokenIn for tokenOut with 0.3% trading fee
     */
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "DEX: Zero amount in");
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "DEX: Invalid token");

        bool isA = tokenIn == address(tokenA);
        (IERC20 inToken, IERC20 outToken) = isA ? (tokenA, tokenB) : (tokenB, tokenA);
        (uint256 inReserve, uint256 outReserve) = isA ? (reserveA, reserveB) : (reserveB, reserveA);

        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 numerator = amountInWithFee * outReserve;
        uint256 denominator = (inReserve * FEE_DENOMINATOR) + amountInWithFee;
        amountOut = numerator / denominator;

        require(amountOut >= minAmountOut, "DEX: Slippage exceeded");
        require(amountOut < outReserve, "DEX: Insufficient liquidity");

        inToken.safeTransferFrom(msg.sender, address(this), amountIn);
        outToken.safeTransfer(msg.sender, amountOut);

        if (isA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        emit Swap(msg.sender, tokenIn, amountIn, address(outToken), amountOut);
    }

    /**
     * @notice Quote expected output given input amount
     */
    function getAmountOut(
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "DEX: Invalid token");
        bool isA = tokenIn == address(tokenA);
        (uint256 inReserve, uint256 outReserve) = isA ? (reserveA, reserveB) : (reserveB, reserveA);

        if (inReserve == 0 || outReserve == 0 || amountIn == 0) return 0;

        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 numerator = amountInWithFee * outReserve;
        uint256 denominator = (inReserve * FEE_DENOMINATOR) + amountInWithFee;
        return numerator / denominator;
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }
}
