pragma solidity ^0.5.0;

import "chainlink/v0.5/contracts/Oracle.sol";
import "../contracts/UniswapExchangeInterface.sol";
import "../contracts/AaveLendingInterface.sol";
import "../contracts/ATokenInterface.sol";

/// @title Flannel Main Contract
/// @author hill399 (github.com/hill399)
/// @notice Extension of Chainlink oracle contract to allow for additional features.
contract Flannel is Ownable {

    Oracle oracle;
    UniswapExchangeInterface internal linkExchangeInterface;
    LendingPool internal lendingPool;

    LinkTokenInterface internal stdLinkTokenInterface;
    LinkTokenInterface internal aaveLinkTokenInterface;
    AToken internal aLinkTokenInterface;

    /* Address of user node */
    address linkNode;

    /* Lending pool approval address */
    address lendingPoolApproval;

    /* Link threshold to trigger action */
    uint256 userThreshold;

    /// @notice Constructor to set default contract values.
    /// @param _uniswapExchange address of Uniswap exchange contract.
    /// @param _stdLinkToken address of Chainlink (LINK) token.
    /// @param _aaveLinkToken address of Aave Link token.
    /// @param _aLinkToken address for the aLink Interest Bearing Token.
    /// @param _oracle address of user-deployed oracle contract.
    /// @param _userThreshold limit in LINK (wei) in which features will trigger
    constructor
    (
    address _uniswapExchange,
    address _stdLinkToken,
    address _aaveLinkToken,
    address _aLinkToken,
    address _oracle,
    address _linkNode,
    address _lendingPool,
    address _lendingPoolApproval,
    uint256 _userThreshold
    )
    public
    {
        linkExchangeInterface = UniswapExchangeInterface(_uniswapExchange);
        stdLinkTokenInterface = LinkTokenInterface(_stdLinkToken);
        aaveLinkTokenInterface = LinkTokenInterface(_aaveLinkToken);
        aLinkTokenInterface = AToken(_aLinkToken);
        oracle = Oracle(_oracle);
        userThreshold = _userThreshold;
        linkNode = _linkNode;

        lendingPool = LendingPool(_lendingPool);
        lendingPoolApproval = _lendingPoolApproval;
    }

    /// @notice Restricts certain calls to node address only.
    modifier onlyNodeAddress()
    {
        require(msg.sender == linkNode, "Only node address can call this");
        _;
    }

    /// @notice Withdraw earned LINK balance from deployed oracle contract.
    /// @dev Only node address can call this.
    /// @dev Function selector : 0x61ff4fac
    function withdrawFromOracle()
    public
    onlyNodeAddress()
    {
        uint256 availableFunds = oracle.withdrawable();
        oracle.withdraw(address(this), availableFunds);
    }

    /// @notice Deposit withdrawn LINK into Aave Protocol
    /// @dev Only node address can call this.
    /// @dev Function selector : 0x06197c1c
    function depositToAave()
    public
    onlyNodeAddress()
    {
        uint256 contractLinkBalance = stdLinkTokenInterface.balanceOf(address(this));
        aaveLinkTokenInterface.approve(lendingPoolApproval, contractLinkBalance + 100);

        lendingPool.deposit(address(aaveLinkTokenInterface), contractLinkBalance, 0);
    }

    /// @notice Withdraw deposited LINK into Aave Protocol
    /// @dev Only node address can call this.
    /// @dev Function selector : 0xd26106e3
    function withdrawFromAave()
    public
    onlyNodeAddress()
    {
        uint256 contractaLinkBalance = aLinkTokenInterface.balanceOf(address(this));
        aLinkTokenInterface.redeem(contractaLinkBalance);
    }

    /// @notice Convert LINK balance to ETH via Uniswap and send to node.
    /// @dev Only node address can call this.
    /// @dev Function selector : 0x5bac1e0d
    function linkToEthTopUp()
    public
    onlyNodeAddress()
    {
        // get link balance from erc20 contract
        uint256 contractLinkBalance = stdLinkTokenInterface.balanceOf(address(this));

        uint256 exchangeRate = linkExchangeInterface.getTokenToEthInputPrice(contractLinkBalance);
        // Approve uniswap for transfer
        stdLinkTokenInterface.approve(address(linkExchangeInterface), contractLinkBalance);
        // Send to node address
        linkExchangeInterface.tokenToEthTransferOutput(exchangeRate, contractLinkBalance, (now + 1 hours), linkNode);
    }

    /// @notice Change address of oracle contract (in case of re-deployment).
    /// @param _liveOracle new address of oracle contract.
    function configureOracleSetup(address _liveOracle, address _linkNode)
    public
    onlyOwner
    {
        oracle = Oracle(_liveOracle);
        linkNode = _linkNode;
    }


    // This threshold needs to be better aligned to handle deposits as percentages.
    /// @notice Change threshold trigger level for withdrawals.
    /// @param _newThreshold new trigger threshold (in wei).
    function setUserThreshold(uint256 _newThreshold)
    public
    onlyOwner
    {
        userThreshold = _newThreshold;
    }

    /// @notice Renounce ownership of oracle contract back to owner of this contract.
    /// @dev Only owner of contract may call this.
    function revertOracleOwnership()
    public
    onlyOwner
    {
        oracle.transferOwnership(msg.sender);
    }
}