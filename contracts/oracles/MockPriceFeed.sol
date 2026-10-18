// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AggregatorV3Interface
 * @notice Standard Chainlink price oracle interface
 */
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

/**
 * @title MockPriceFeed
 * @notice Mock Chainlink Price Feed with settable price for testing & dynamic NAV demonstration
 */
contract MockPriceFeed is AggregatorV3Interface {
    uint8 private _decimals;
    string private _description;
    uint256 private _version = 1;
    int256 private _latestPrice;
    uint256 private _updatedAt;
    uint80 private _roundId = 1;

    event PriceUpdated(int256 newPrice, uint256 updatedAt);

    constructor(uint8 decimals_, string memory description_, int256 initialPrice) {
        _decimals = decimals_;
        _description = description_;
        _latestPrice = initialPrice;
        _updatedAt = block.timestamp;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return _description;
    }

    function version() external view override returns (uint256) {
        return _version;
    }

    function updatePrice(int256 newPrice) external {
        _latestPrice = newPrice;
        _roundId++;
        _updatedAt = block.timestamp;
        emit PriceUpdated(newPrice, _updatedAt);
    }

    function getRoundData(uint80 roundId_) external view override returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (roundId_, _latestPrice, _updatedAt, _updatedAt, roundId_);
    }

    function latestRoundData() external view override returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (_roundId, _latestPrice, _updatedAt, _updatedAt, _roundId);
    }
}
