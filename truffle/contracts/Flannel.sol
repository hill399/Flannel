pragma solidity ^0.5.0;

import "chainlink/v0.5/contracts/Oracle.sol";
import "../contracts/UniswapExchangeInterface.sol";
import "../contracts/AaveLendingInterface.sol";
import "../contracts/ATokenInterface.sol";

/// @title Flannel Main Contract
/// @author hill399 (github.com/hill399)
/// @notice Extension of Chainlink oracle contract to allow for additional features.
contract Flannel is Ownable {

    using SafeMath for uint256;

    Oracle oracle;
    UniswapExchangeInterface internal linkExchangeInterface;
    LendingPool internal lendingPool;

    LinkTokenInterface internal stdLinkTokenInterface;
    LinkTokenInterface internal aaveLinkTokenInterface;
    AToken internal aLinkTokenInterface;

    uint256 constant FINNEY = 1 * 10 ** 15;
    uint256 constant ETHER = 1 * 10 ** 18;

    /* Address of user node */
    address linkNode;

    /* Lending pool approval address */
    address lendingPoolApproval;

    /* Struct to customise and store allowances */
    struct thresholds {
        string paramsName;
        uint256 pcUntouched;
        uint256 pcAave;
        uint256 pcTopUp;
        uint256 linkThreshold;
        uint256 ethThreshold;
        uint256 ethTopUp;
    }

    /* Mapping to hold customised allowances */
    mapping(uint => thresholds) public userStoredParams;
    uint256 public paramCounter;
    uint256 public paramsInUse;

    /// @notice Constructor to set default contract values.
    /// @param _uniswapExchange address of Uniswap exchange contract.
    /// @param _stdLinkToken address of Chainlink (LINK) token.
    /// @param _aaveLinkToken address of Aave Link token.
    /// @param _aLinkToken address for the aLink Interest Bearing Token.
    /// @param _oracle address of user-deployed oracle contract.
    constructor
    (
    address _uniswapExchange,
    address _stdLinkToken,
    address _aaveLinkToken,
    address _aLinkToken,
    address _oracle,
    address _linkNode,
    address _lendingPool,
    address _lendingPoolApproval
    )
    public
    {
        linkExchangeInterface = UniswapExchangeInterface(_uniswapExchange);
        stdLinkTokenInterface = LinkTokenInterface(_stdLinkToken);
        aaveLinkTokenInterface = LinkTokenInterface(_aaveLinkToken);
        aLinkTokenInterface = AToken(_aLinkToken);
        oracle = Oracle(_oracle);
        linkNode = _linkNode;

        lendingPool = LendingPool(_lendingPool);
        lendingPoolApproval = _lendingPoolApproval;

        /* Create default param account */
        /* Fix those token mod values */
        userStoredParams[0] = thresholds("Default", 20, 60, 20, 10 * ETHER, 10 * FINNEY, 50 * FINNEY);
        paramCounter = 1;
        paramsInUse = 0;
    }

    /// @notice Restricts certain calls to node address only.
    modifier onlyNodeAddress()
    {
        require(msg.sender == linkNode, "Only node address can call this");
        _;
    }

    /// @notice Create new parameter settings to distribute withdrawn LINK.
    /// @param _paramsName Reference name of params.
    /// @param _pcUntouched % to leave untouched in contract.
    /// @param _pcAave % to deposited to Aave.
    /// @param _pcTopUp % to allocate to node top-up.
    /// @param _linkThreshold LINK value in wei to determine when to withdraw from Oracle contract.
    /// @param _ethThreshold ETH value in wei to determine when to top-up LINK node.
    /// @param _ethTopUp ETH value in wei to top-up LINK node when triggered.
    /// @dev Only owner can call this.
    /// @dev Function selector :
    function createNewAllowance(
    string memory _paramsName,
    uint256 _pcUntouched,
    uint256 _pcAave,
    uint256 _pcTopUp,
    uint256 _linkThreshold,
    uint256 _ethThreshold,
    uint256 _ethTopUp)
    public
    onlyOwner
    {
        uint256 pcTemp = _pcUntouched.add(_pcAave);
        pcTemp = pcTemp.add(_pcTopUp);
        require(pcTemp == 100, "Percent parameters do not equal 100");
        userStoredParams[paramCounter] = thresholds(_paramsName, _pcUntouched, _pcAave, _pcTopUp, _linkThreshold, _ethThreshold, _ethTopUp);
        paramsInUse = paramCounter;
        paramCounter = paramCounter.add(1);
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

    /// @notice Set threshold parameter set to use.
    /// @param _paramNo new address of oracle contract.
    function setParametersInUse(uint256 _paramNo)
    public
    onlyOwner
    {
        require(_paramNo < paramCounter, "Invalid parameter set");
        paramsInUse = _paramNo;
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