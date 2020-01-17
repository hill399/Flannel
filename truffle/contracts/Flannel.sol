pragma solidity 0.4.24;

import "chainlink/contracts/Oracle.sol";

contract UniswapExchangeInterface {
    // Address of ERC20 token sold on this exchange
    function tokenAddress() external view returns (address token);
    // Address of Uniswap Factory
    function factoryAddress() external view returns (address factory);
    // Provide Liquidity
    function addLiquidity(uint256 min_liquidity, uint256 max_tokens, uint256 deadline) external payable returns (uint256);
    function removeLiquidity(uint256 amount, uint256 min_eth, uint256 min_tokens, uint256 deadline) external returns (uint256, uint256);
    // Get Prices
    function getEthToTokenInputPrice(uint256 eth_sold) external view returns (uint256 tokens_bought);
    function getEthToTokenOutputPrice(uint256 tokens_bought) external view returns (uint256 eth_sold);
    function getTokenToEthInputPrice(uint256 tokens_sold) external view returns (uint256 eth_bought);
    function getTokenToEthOutputPrice(uint256 eth_bought) external view returns (uint256 tokens_sold);
    // Trade ETH to ERC20
    function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline) external payable returns (uint256  tokens_bought);
    function ethToTokenTransferInput(uint256 min_tokens, uint256 deadline, address recipient) external payable returns (uint256  tokens_bought);
    function ethToTokenSwapOutput(uint256 tokens_bought, uint256 deadline) external payable returns (uint256  eth_sold);
    function ethToTokenTransferOutput(uint256 tokens_bought, uint256 deadline, address recipient) external payable returns (uint256  eth_sold);
    // Trade ERC20 to ETH
    function tokenToEthSwapInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline) external returns (uint256  eth_bought);
    function tokenToEthTransferInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline, address recipient) external returns (uint256  eth_bought);
    function tokenToEthSwapOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline) external returns (uint256  tokens_sold);
    function tokenToEthTransferOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline, address recipient) external returns (uint256  tokens_sold);
    // Trade ERC20 to ERC20
    function tokenToTokenSwapInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address token_addr) external returns (uint256  tokens_bought);
    function tokenToTokenTransferInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address recipient, address token_addr) external returns (uint256  tokens_bought);
    function tokenToTokenSwapOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address token_addr) external returns (uint256  tokens_sold);
    function tokenToTokenTransferOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address recipient, address token_addr) external returns (uint256  tokens_sold);
    // Trade ERC20 to Custom Pool
    function tokenToExchangeSwapInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address exchange_addr) external returns (uint256  tokens_bought);
    function tokenToExchangeTransferInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address recipient, address exchange_addr) external returns (uint256  tokens_bought);
    function tokenToExchangeSwapOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address exchange_addr) external returns (uint256  tokens_sold);
    function tokenToExchangeTransferOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address recipient, address exchange_addr) external returns (uint256  tokens_sold);
    // ERC20 comaptibility for liquidity tokens
    bytes32 public name;
    bytes32 public symbol;
    uint256 public decimals;
    function transfer(address _to, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 value) external returns (bool);
    function approve(address _spender, uint256 _value) external returns (bool);
    function allowance(address _owner, address _spender) external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    // Never use
    function setup(address token_addr) external;
}

/// @title Flannel Main Contract
/// @author hill399 (github.com/hill399)
/// @notice Extension of Chainlink oracle contract to allow for additional features.
contract Flannel is Ownable {

    /* Contract imports */
    Oracle oracle;
    UniswapExchangeInterface internal linkExchangeInterface;
    LinkTokenInterface internal linkTokenInterface;

    /* Address of user node */
    address linkNode;

    /* Link threshold to trigger action */
    uint256 userThreshold;

    /// @notice Constructor to set default contract values.
    /// @param _uniswapExchange address of Uniswap exchange contract.
    /// @param _linkToken address of Chainlink (LINK) token.
    /// @param _linkNode ETH address of user hosted node.
    /// @param _oracle address of user-deployed oracle contract.
    /// @param _userThreshold limit in LINK (wei) in which features will trigger
    constructor(address _uniswapExchange, address _linkToken, address _linkNode, address _oracle, uint256 _userThreshold)
    public
    {
        linkExchangeInterface = UniswapExchangeInterface(_uniswapExchange);
        linkTokenInterface = LinkTokenInterface(_linkToken);
        linkNode = _linkNode;
        oracle = Oracle(_oracle);
        userThreshold = _userThreshold;
    }

    /// @notice Modifier to allow only the user LINK node to trigger certain functions.
    modifier onlyNode
    {
        require(msg.sender == linkNode, "Only node adapter can call this");
        _;
    }

    /// @notice Change address of oracle contract (in case of re-deployment).
    /// @param _liveOracle new address of oracle contract.
    function setOracleContract(address _liveOracle)
    public
    onlyOwner
    {
        oracle = Oracle(_liveOracle);
    }


    /// @notice Renounce ownership of oracle contract back to owner of this contract.
    /// @dev Only owner of contract may call this.
    function revertOracleOwnership()
    public
    onlyOwner
    {
        oracle.transferOwnership(owner);
    }

    /// @notice Withdraw earned LINK balance from deployed oracle contract.
    /// @dev Only chainlink node can call this.
    /// @dev Function selector : 0x61ff4fac
    function withdrawFromOracle()
    public
    onlyNode
    {
        // get link balance from oracle contract
        uint256 oracleLinkBalance = linkTokenInterface.balanceOf(address(oracle));

        // Trigger uniswap conversion at given user-provided threshold levels
        if(oracleLinkBalance >= userThreshold){
            uint256 availableFunds = oracle.withdrawable();
            oracle.withdraw(address(this), availableFunds);
        }
    }

    /// @notice Convert LINK balance to ETH via Uniswap and send to node.
    /// @dev Function selector : 0x5bac1e0d
    function linkToEthTopUp()
    public
    onlyNode
    {
        // get link balance from erc20 contract
        uint256 contractLinkBalance = linkTokenInterface.balanceOf(address(this));

        // Trigger uniswap conversion at given user-provided threshold levels
        if(contractLinkBalance >= userThreshold){
            uint256 exchangeRate = linkExchangeInterface.getTokenToEthInputPrice(contractLinkBalance);
            // Approve uniswap for transfer
            linkTokenInterface.approve(address(linkExchangeInterface), contractLinkBalance);
            // Send to node address
            linkExchangeInterface.tokenToEthTransferOutput(exchangeRate, contractLinkBalance, (now + 1 hours), linkNode);
        }
    }
}