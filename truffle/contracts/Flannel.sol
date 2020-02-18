pragma solidity ^0.5.0;

import "../contracts/IFlannel.sol";

/// @title Flannel Main Contract
/// @author hill399 (github.com/hill399)
/// @notice Extension of Chainlink oracle contract to allow for additional features.
contract Flannel is IFlannel {

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
        userStoredParams = thresholds("Default", 20, 60, 20, 5 * ETHER, 1 * ETHER, 10 * ETHER, 300 * FINNEY);
    }

    /// @notice Restricts certain calls to node address only.
    modifier onlyNodeAddress()
    {
        require(msg.sender == linkNode, "Only node address can call this");
        _;
    }


    /// @notice Single function to call from node initiator job.
    /// @dev Only the user's LINK node should call this.
    /// @dev Function Selector : 0x86b12681
    function flannelCoordinator()
    public
    onlyNodeAddress()
    {
        uint256 availableFunds = oracle.withdrawable();
        if(availableFunds >= userStoredParams.linkThreshold){
           _withdrawFromOracle(availableFunds);
        }

        if(linkNode.balance <= userStoredParams.ethThreshold){
           require(linkNode != address(0), "Invalid LinkNode Address");
           _linkToEthTopUp(topUpBalance);
        }

        if(aaveBalance <= userStoredParams.aaveThreshold){
           _depositToAave(aaveBalance);
        }
    }

    /// @notice Manual override to withdraw from oracle
    /// @param _amount Amount of LINK in wei to withdraw.
    /// @dev onlyOwner wrapper for internal function.
    function manualWithdrawFromOracle(uint256 _amount)
    public
 //   onlyOwner
    {
        _withdrawFromOracle(_amount);
    }

    /// @notice Manual override to top-up node address
    /// @param _amount Amount of LINK in wei to convert via Uniswap.
    /// @dev onlyOwner wrapper for internal function.
    function manualLinkToEthTopUp(uint256 _amount)
    public
    onlyOwner
    {
        _linkToEthTopUp(_amount);
    }

    /// @notice Manual override to deposit LINK to Aave.
    /// @param _amount Amount of LINK in wei to deposit.
    /// @dev onlyOwner wrapper for internal function.
    function manualDepositToAave(uint256 _amount)
    public
    onlyOwner
    {
        _depositToAave(_amount);
    }

    /// @notice Manual override to withdraw LINK from Aave.
    /// @param _amount Amount of aLINK in wei to withdraw.
    /// @dev onlyOwner wrapper for internal function.
    function manualWithdrawFromAave(uint256 _amount)
    public
    onlyOwner
    {
        _withdrawFromAave(_amount);
    }

    /// @notice Change address of oracle contract (in case of re-deployment).
    /// @param _liveOracle new address of oracle contract.
    /// @dev Only contract owner can call this.
    function configureOracleSetup(address _liveOracle, address _linkNode)
    public
    onlyOwner
    {
        oracle = Oracle(_liveOracle);
        linkNode = _linkNode;
    }

    /// @notice Withdraw balances from Flannel contract.
    /// @param _param balance store to withdraw from (see in-line comments).
    /// @param _amount amount in wei to withdraw from given balance store.
    /// @dev only contract owner can call this.
    function withdrawFromFlannel(uint256 _param, uint256 _amount)
    public
    onlyOwner
    {
        if(_param == 0){
            require(_param <= storeBalance, "Insufficient funds in store balance");
            stdLinkTokenInterface.transfer(msg.sender, _amount);
            storeBalance = storeBalance.sub(_amount);
        }
        if(_param == 1){
            require(_param <= aaveBalance, "Insufficient funds in aave balance");
            stdLinkTokenInterface.transfer(msg.sender, _amount);
            aaveBalance = aaveBalance.sub(_amount);
        }
        if(_param == 2){
            require(_param <= topUpBalance, "Insufficient funds in top-up balance");
            stdLinkTokenInterface.transfer(msg.sender, _amount);
            topUpBalance = topUpBalance.sub(_amount);
        }
    }

    /// @notice Create new parameter settings to distribute withdrawn LINK.
    /// @param _paramsName Reference name of params.
    /// @param _pcUntouched % to leave untouched in contract.
    /// @param _pcAave % to deposited to Aave.
    /// @param _pcTopUp % to allocate to node top-up.
    /// @param _linkThreshold LINK value in wei to determine when to withdraw from Oracle contract.
    /// @param _ethThreshold ETH value in wei to determine when to top-up LINK node.
    /// @param _aaveThreshold LINK value in wei to determine when to trigger Aave deposit.
    /// @param _ethTopUp ETH value in wei to top-up LINK node when triggered.
    /// @dev Only owner can call this.
    function createNewAllowance(
    string memory _paramsName,
    uint256 _pcUntouched,
    uint256 _pcAave,
    uint256 _pcTopUp,
    uint256 _linkThreshold,
    uint256 _ethThreshold,
    uint256 _aaveThreshold,
    uint256 _ethTopUp)
    public
    onlyOwner
    {
        uint256 pcTemp = _pcUntouched.add(_pcAave);
        pcTemp = pcTemp.add(_pcTopUp);
        require(pcTemp == 100, "Percent parameters do not equal 100");
        userStoredParams = thresholds(_paramsName, _pcUntouched, _pcAave, _pcTopUp, _linkThreshold, _ethThreshold, _aaveThreshold, _ethTopUp);
    }

    /// @notice Renounce ownership of oracle contract back to owner of this contract.
    /// @dev Only owner of contract may call this.
    /// @dev Only contract owner can call this.
    function revertOracleOwnership()
    public
    onlyOwner
    {
        oracle.transferOwnership(msg.sender);
    }

    /// @notice Return the operating addresses tied to this contract.
    function getAddresses()
    public
    view
    returns (address, address)
    {
        return (address(oracle), linkNode);
    }

}
