pragma solidity ^0.5.0;

import "chainlink/v0.5/contracts/Oracle.sol";
import "../contracts/UniswapExchangeInterface.sol";
import "../contracts/AaveLendingInterface.sol";
import "../contracts/ATokenInterface.sol";

/// @title Flannel Internal Contract
/// @author hill399 (github.com/hill399)
/// @notice Internal and helper functions for main Flannel contract (Flannel.sol)
contract IFlannel is Ownable {

    using SafeMath for uint256;

    Oracle internal oracle;
    UniswapExchangeInterface internal linkExchangeInterface;
    LendingPool internal lendingPool;

    LinkTokenInterface internal stdLinkTokenInterface;
    LinkTokenInterface internal aaveLinkTokenInterface;
    AToken internal aLinkTokenInterface;

    uint256 constant FINNEY = 1 * 10 ** 15;
    uint256 constant ETHER = 1 * 10 ** 18;

    /* Address of user node */
    address internal linkNode;

    /* Lending pool approval address */
    address internal lendingPoolApproval;

    /* Struct to customise and store allowances */
    struct thresholds {
        string paramsName;
        uint256 pcUntouched;
        uint256 pcAave;
        uint256 pcTopUp;
        uint256 linkThreshold;
        uint256 ethThreshold;
        uint256 aaveThreshold;
        uint256 ethTopUp;
    }

    /* Mapping to hold customised allowances */
    mapping(uint => thresholds) public userStoredParams;
    uint256 public paramCounter;
    uint256 public paramsInUse;

    uint256 public storeBalance;
    uint256 public aaveBalance;
    uint256 public topUpBalance;

    /// @notice Withdraw earned LINK balance from deployed oracle contract.
    /// @dev Only node address can call this.
    /// @dev Function selector : 0x61ff4fac
    function _withdrawFromOracle(uint256 _amount)
    internal
    {
        require(_amount <= oracle.withdrawable(), "Not enough LINK in oracle to withdraw");
        oracle.withdraw(address(this), _amount);
        storeBalance = storeBalance.add(_percentHelper(_amount, userStoredParams[paramsInUse].pcUntouched));
        aaveBalance = aaveBalance.add(_percentHelper(_amount, userStoredParams[paramsInUse].pcAave));
        topUpBalance = topUpBalance.add(_percentHelper(_amount, userStoredParams[paramsInUse].pcTopUp));
    }

    /// @notice Deposit withdrawn LINK into Aave Protocol
    /// @dev On testnet, Aave utilise their own LINK token. On test launch, a given amount is send to Flannel so that "representative"
    ///      transactions can be made.
    /// @dev Only node address can call this.
    /// @dev Function selector : 0x06197c1c
    function _depositToAave(uint256 _amount)
    internal
    {
        require(_amount >= aaveBalance, "Not enough allocated Aave Deposit funds");
        // Approve for aaveLINK tokens to be moved by the lending interface.
        aaveLinkTokenInterface.approve(lendingPoolApproval, _amount + 100);
        // Deposit aaveLINK into interest bearing contract.
        lendingPool.deposit(address(aaveLinkTokenInterface), _amount, 0);
        aaveBalance = aaveBalance.sub(_amount);
    }

    /// @notice Withdraw deposited LINK into Aave Protocol
    /// @dev Only node address can call this.
    function _withdrawFromAave(uint256 _amount)
    internal
    {
        // Catch that _amount is greater thzan contract aLINK balance.
        require(_amount <= aLinkTokenInterface.balanceOf(address(this)), "Not enough aLINK in contract");
        // Redeem LINK using aLINK redeem function.
        aLinkTokenInterface.redeem(_amount);
    }

    /// @notice Convert LINK balance to ETH via Uniswap and send to node.
    /// @dev Only node address can call this.
    function _linkToEthTopUp(uint256 _amount)
    internal
    {
        require(_amount <= topUpBalance, "Not enough LINK to top-up");
        // Catch if topUpBalance is less than ethTopUp
        uint256 topBalance;
        if(_amount >= userStoredParams[paramsInUse].ethTopUp) {
            topBalance = userStoredParams[paramsInUse].ethTopUp;
        } else {
            topBalance = _amount;
        }
        // Get current LINK -> ETH conversion rate
        uint256 exchangeRate = linkExchangeInterface.getTokenToEthInputPrice(topBalance);
        // Approve uniswap for transfer
        stdLinkTokenInterface.approve(address(linkExchangeInterface), topBalance);
        // Send to node address
        linkExchangeInterface.tokenToEthTransferOutput(exchangeRate, topBalance, (now + 1 hours), linkNode);
        // Reset topUpBalance
        topUpBalance = topUpBalance.sub(topBalance);
    }

    /// @notice Helper function to generate percentage of value
    /// @dev (_value/100) * _percentage
    function _percentHelper(uint256 _value, uint256 _percentage)
    internal
    pure
    returns
    (uint256)
    {
        uint256 tmpPer = _value.div(100);
        tmpPer = tmpPer.mul(_percentage);
        return tmpPer;
    }
}