pragma solidity ^0.5.0;

/**
* @title LendingPool contract
* @notice Implements the actions of the LendingPool, and exposes accessory methods to fetch the users and reserve data
* @author Aave
 **/

contract LendingPool {
    /**
    * @dev deposits The underlying asset into the reserve. A corresponding amount of the overlying asset (aTokens)
    * is minted.
    * @param _reserve the address of the reserve
    * @param _amount the amount to be deposited
    * @param _referralCode integrators are assigned a referral code and can potentially receive rewards.
    **/
    function deposit(address _reserve, uint256 _amount, uint16 _referralCode) external payable;

    /**
    * @dev Redeems the underlying amount of assets requested by _user.
    * This function is executed by the overlying aToken contract in response to a redeem action.
    * @param _reserve the address of the reserve
    * @param _user the address of the user performing the action
    * @param _amount the underlying amount to be redeemed
    **/
    function redeemUnderlying(address _reserve, address payable _user, uint256 _amount, uint256 _aTokenBalanceAfterRedeem) external;

    /**
    * @dev Allows users to borrow a specific amount of the reserve currency, provided that the borrower
    * already deposited enough collateral.
    * @param _reserve the address of the reserve
    * @param _amount the amount to be borrowed
    * @param _interestRateMode the interest rate mode at which the user wants to borrow. Can be 0 (STABLE) or 1 (VARIABLE)
    **/
    function borrow(address _reserve, uint256 _amount, uint256 _interestRateMode, uint16 _referralCode) external;

    /**
    * @notice repays a borrow on the specific reserve, for the specified amount (or for the whole amount, if uint256(-1) is specified).
    * @dev the target user is defined by _onBehalfOf. If there is no repayment on behalf of another account,
    * _onBehalfOf must be equal to msg.sender.
    * @param _reserve the address of the reserve on which the user borrowed
    * @param _amount the amount to repay, or uint256(-1) if the user wants to repay everything
    * @param _onBehalfOf the address for which msg.sender is repaying.
    **/

    function repay(address _reserve, uint256 _amount, address payable _onBehalfOf) external payable;

    /**
    * @dev borrowers can user this function to swap between stable and variable borrow rate modes.
    * @param _reserve the address of the reserve on which the user borrowed
    **/
    function swapBorrowRateMode(address _reserve) external;

    /**
    * @dev rebalances the stable interest rate of a user if current liquidity rate > user stable rate.
    * this is regulated by Aave to ensure that the protocol is not abused, and the user is paying a fair
    * rate. Anyone can call this function though.
    * @param _reserve the address of the reserve
    * @param _user the address of the user to be rebalanced
    **/
    function rebalanceStableBorrowRate(address _reserve, address _user) external;

    /**
    * @dev allows depositors to enable or disable a specific deposit as collateral.
    * @param _reserve the address of the reserve
    * @param _useAsCollateral true if the user wants to user the deposit as collateral, false otherwise.
    **/
    function setUserUseReserveAsCollateral(address _reserve, bool _useAsCollateral) external;


    /**
    * @dev users can invoke this function to liquidate an undercollateralized position.
    * @param _reserve the address of the collateral to liquidated
    * @param _reserve the address of the principal reserve
    * @param _user the address of the borrower
    * @param _purchaseAmount the amount of principal that the liquidator wants to repay
    * @param _receiveAToken true if the liquidators wants to receive the aTokens, false if
    * he wants to receive the underlying asset directly
    **/
    function liquidationCall(address _collateral, address _reserve, address _user, uint256 _purchaseAmount, bool _receiveAToken) external payable;

    /**
    * @dev allows smartcontracts to access the liquidity of the pool within one transaction,
    * as long as the amount taken plus a fee is returned. NOTE There are security concerns for developers of flashloan receiver contracts
    * that must be kept into consideration. For further details please visit https://developers.aave.com
    * @param _receiver The address of the contract receiving the funds. The receiver should implement the IFlashLoanReceiver interface.
    * @param _reserve the address of the principal reserve
    * @param _amount the amount requested for this flashloan
    **/
    function flashLoan(address _receiver, address _reserve, uint256 _amount, bytes memory _params) public;

    /**
    * @dev accessory functions to fetch data from the core contract
    **/

    function getReserveConfigurationData(address _reserve) external view returns
        (
            uint256 ltv,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            address interestRateStrategyAddress,
            bool usageAsCollateralEnabled,
            bool borrowingEnabled,
            bool stableBorrowRateEnabled,
            bool isActive
        );


    function getReserveData(address _reserve) external view returns
        (
            uint256 totalLiquidity,
            uint256 availableLiquidity,
            uint256 totalBorrowsStable,
            uint256 totalBorrowsVariable,
            uint256 liquidityRate,
            uint256 variableBorrowRate,
            uint256 stableBorrowRate,
            uint256 averageStableBorrowRate,
            uint256 utilizationRate,
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            address aTokenAddress,
            uint40 lastUpdateTimestamp
        );


    function getUserAccountData(address _user) external view returns
        (
            uint256 totalLiquidityETH,
            uint256 totalCollateralETH,
            uint256 totalBorrowsETH,
            uint256 totalFeesETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );


    function getUserReserveData(address _reserve, address _user) external view returns
        (
            uint256 currentATokenBalance,
            uint256 currentBorrowBalance,
            uint256 principalBorrowBalance,
            uint256 borrowRateMode,
            uint256 borrowRate,
            uint256 liquidityRate,
            uint256 originationFee,
            uint256 variableBorrowIndex,
            uint256 lastUpdateTimestamp,
            bool usageAsCollateralEnabled
        );

    function getReserves() external view returns (address[] memory);
}