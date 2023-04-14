// SPDX-License-Identifier: MIT
pragma solidity =0.6.6;

// import "hardhat/console.sol";
import './interfaces/ISQNK.sol';
import './periphery/interfaces/IWETH.sol';
import './periphery/interfaces/IUniswapV2Router02.sol';
import './core/interfaces/IUniswapV2Pair.sol';

contract SQNET {
	address private routerAddress;
	address private sqnkAddress;
	address private owner;
	address private weth;
	address private usdtAddress;

	mapping(address => uint) public lastClaims;
	mapping (address => bool) private excludedFromRewards;

	constructor(
		address _routerAddress,
		address _sqnkAddress,
		address _usdtAddress
	) public {
		routerAddress = _routerAddress;
		sqnkAddress = _sqnkAddress;
		weth = IUniswapV2Router02(routerAddress).WETH();
		usdtAddress = _usdtAddress;
		owner = msg.sender;
	}

	receive() external payable {}

	modifier onlyOwner() {
    require(msg.sender == owner, 'Only owner');
    _;
  }

	function getLastClaim(address _address) external view returns(uint) {
		return lastClaims[_address];
	}

	function transferOwnership(address _address) public onlyOwner {
		owner = _address;
	}

	function setRouterAddress(address _address) public onlyOwner {
		routerAddress = _address;
	}

	function setweth(address _address) public onlyOwner {
		weth = _address;
	}

	function setSqnkAddress(address _address) public onlyOwner {
		sqnkAddress = _address;
	}

	function getSplittedTaxes(uint amount) internal view returns(uint marketingAmountSqnk, uint liquidityAmountSqnk) {
		ISQNK sqnk = ISQNK(sqnkAddress);
		(,, uint liquidityTax) = sqnk.getTaxes();
		liquidityAmountSqnk = amount * liquidityTax / 100;
		marketingAmountSqnk = amount - liquidityAmountSqnk;
	}

	function countSqnkReward(address user) internal returns(uint userReward) {
		ISQNK sqnk = ISQNK(sqnkAddress);
		uint rewardSqnkBalance = sqnk.balanceOf(sqnk.rewardWallet());
		uint rewardPercentage = (sqnk.balanceOf(user) * 100 * 1e18 / sqnk.totalSupply());
		userReward = rewardSqnkBalance * rewardPercentage / 100 / 1e18;
		require(userReward > 0, 'Not enough Sqnk rewards');
	}

	function getAvailableUsdtRewards(uint sqnkIn) external view returns(uint) {
		address[] memory path0 = new address[](2);
		path0[0] = sqnkAddress;
		path0[1] = weth;

		address[] memory path1 = new address[](2);
		path1[0] = weth;
		path1[1] = usdtAddress;

		uint[] memory ethOut = IUniswapV2Router02(routerAddress).getAmountsOut(sqnkIn, path0);
		uint[] memory usdtOut = IUniswapV2Router02(routerAddress).getAmountsOut(ethOut[1], path1);

		return usdtOut[1];
	}

	function swapMarketingTaxesForETH() public {
		ISQNK sqnk = ISQNK(sqnkAddress);
		require(sqnk.admins(msg.sender) == true || msg.sender == owner, 'Not allowed');
		address marketingWallet = sqnk.marketingWallet();
		uint balance = sqnk.balanceOf(marketingWallet);

		require(balance >= 0, 'Not enough balance in marketing wallet');

		sqnk.approveMarketingWallet(balance);
		sqnk.transferFrom(marketingWallet, address(this), balance);

		address[] memory path = new address[](2);
		path[0] = sqnkAddress;
		path[1] = weth;

		(uint marketingAmountSqnk, uint liquidityAmountSqnk) = getSplittedTaxes(balance);

		swapTokenForToken(marketingAmountSqnk, path, marketingWallet);
		uint liquidityAmountEth = swapTokenForToken(liquidityAmountSqnk / 2, path, address(this));
	
		sqnk.approve(routerAddress, liquidityAmountSqnk / 2);

		IUniswapV2Router02(routerAddress).addLiquidityETH{value:liquidityAmountEth}(
			path[0],
			liquidityAmountSqnk / 2,
			0,
			liquidityAmountEth,
			owner,
			block.timestamp
		);
	}

	function swapRewardTaxesForETH(uint amountIn) private returns(uint amountOut) {
		ISQNK sqnk = ISQNK(sqnkAddress);
		address rewardWallet = sqnk.rewardWallet();

		require(sqnk.balanceOf(rewardWallet) >= amountIn, 'Not enough balance in reward wallet');

		sqnk.approveRewardWallet(amountIn);
		sqnk.transferFrom(rewardWallet, address(this), amountIn);

		address[] memory path = new address[](2);
		path[0] = sqnkAddress;
		path[1] = weth;

		amountOut = swapTokenForToken(amountIn, path, address(this));
	}

	function swapTokenForToken(uint amountIn, address[] memory path, address to) private returns(uint amountOut) {
		uint[] memory amounts = IUniswapV2Router02(routerAddress).getAmountsOut(amountIn, path);

		amountOut = amounts[1];
	
		IERC20(path[0]).approve(routerAddress, amountIn);

		if (path[1] == weth) {
			IUniswapV2Router02(routerAddress).swapExactTokensForETH(amountIn, amountOut, path, to, block.timestamp);
		} else {
			IUniswapV2Router02(routerAddress).swapExactETHForTokens{value: amountIn}(amountOut, path, to, block.timestamp);
		}
	}

	function claimRewards(address rewardToken0, address rewardToken1) public {
		ISQNK sqnk = ISQNK(sqnkAddress);
		require(rewardToken0 != sqnkAddress && rewardToken1 != sqnkAddress, 'No Sqnk as reward');
		require(!excludedFromRewards[msg.sender], 'This user is not allowed to claim rewards');

		uint lastClaim = lastClaims[msg.sender];

		if (lastClaim == 0) {
			lastClaims[msg.sender] = now;
		} else {
			uint hoursDiff = (now - lastClaim) / 1 minutes;
			require(hoursDiff >= 3, 'You can only claim once per 3 mins');
			lastClaims[msg.sender] = now;
		}


		uint userBalance = sqnk.balanceOf(msg.sender);

		require(userBalance > 0, 'No Sqnk balance');
		uint rewardSqnkBalance = sqnk.balanceOf(sqnk.rewardWallet());

		if (rewardSqnkBalance > 0) {
			uint userReward = countSqnkReward(msg.sender);
			uint amountOut = swapRewardTaxesForETH(userReward);
			uint amountToConvert = amountOut / 2;

			address[] memory path0 = new address[](2);
			path0[0] = weth;
			path0[1] = rewardToken0;

			address[] memory path1 = new address[](2);
			path1[0] = weth;
			path1[1] = rewardToken1;

			if (rewardToken0 == weth && rewardToken1 == weth) {
				IWETH(weth).deposit{value: amountOut}();
				IWETH(weth).transfer(msg.sender, amountOut);
			} else if (rewardToken0 == weth) {
				IWETH(weth).deposit{value: amountToConvert}();
				IWETH(weth).transfer(msg.sender, amountToConvert);
				swapTokenForToken(amountToConvert, path1, msg.sender);
			} else if (rewardToken1 == weth) {
				IWETH(weth).deposit{value: amountToConvert}();
				IWETH(weth).transfer(msg.sender, amountToConvert);
				swapTokenForToken(amountToConvert, path0, msg.sender);
			} else {
				swapTokenForToken(amountToConvert, path0, msg.sender);
				swapTokenForToken(amountToConvert, path1, msg.sender);
			}
		}
	}

	function removeLiquidityETH(
		address pair,
		uint liquidity,
		uint amountTokenMin,
		uint amountETHMin,
		address to
	) public {
		ISQNK(sqnkAddress).setTaxEnabled(false);
		IUniswapV2Pair(pair).transferFrom(msg.sender, address(this), liquidity);
		IUniswapV2Pair(pair).approve(routerAddress, liquidity);
		IUniswapV2Router02(routerAddress).removeLiquidityETH(sqnkAddress, liquidity, amountTokenMin, amountETHMin, to, block.timestamp);
		ISQNK(sqnkAddress).setTaxEnabled(true);
	}

	function setExcludedFromRewards (address _address, bool _status) public onlyOwner {
    excludedFromRewards[_address] = _status;
  }

  function getExcludedFromRewards (address _address) public view returns (bool) {
    return excludedFromRewards[_address];
  }
}
