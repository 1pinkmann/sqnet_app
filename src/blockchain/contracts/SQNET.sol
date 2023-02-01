pragma solidity =0.6.6;

import "hardhat/console.sol";
import './interfaces/ISQT.sol';
import './periphery/interfaces/IWETH.sol';
import './periphery/interfaces/IUniswapV2Router02.sol';
import './core/interfaces/IUniswapV2Pair.sol';

contract SQNET {
	address private routerAddress;
	address private sqtAddress;
	address private owner;
	address private weth;
	address private usdtAddress;

	mapping(address => uint) public lastClaims;

	constructor(
		address _routerAddress,
		address _sqtAddress,
		address _usdtAddress
	) public {
		routerAddress = _routerAddress;
		sqtAddress = _sqtAddress;
		weth = IUniswapV2Router02(routerAddress).WETH();
		usdtAddress = _usdtAddress;
		owner = msg.sender;
	}

	receive() external payable {}

	modifier onlyOwner() {
    require(msg.sender == owner, 'Only owner');
    _;
  }


	function getLastClaim(address _address) public view returns(uint) {
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

	function setSqtAddress(address _address) public onlyOwner {
		sqtAddress = _address;
	}

	function getSplittedTaxes(uint amount) public returns(uint marketingAmountSqt, uint liquidityAmountSqt) {
		ISQT sqt = ISQT(sqtAddress);

		liquidityAmountSqt = amount * sqt.getLiquidityTax() / 100;
		marketingAmountSqt = amount - liquidityAmountSqt;
	}

	function countSqtReward(address user) public returns(uint userReward) {
		ISQT sqt = ISQT(sqtAddress);
		uint rewardSqtBalance = sqt.balanceOf(sqt.rewardWallet());
		uint rewardPercentage = (sqt.balanceOf(user) * 100 * 1e18 / sqt.totalSupply());
		userReward = rewardSqtBalance * rewardPercentage / 100 / 1e18;
		require(userReward > 0, 'Not enough SQT rewards');
	}

	function getAvailableUsdtRewards(uint sqtIn) external view returns(uint) {
		address[] memory path0 = new address[](2);
		path0[0] = sqtAddress;
		path0[1] = weth;

		address[] memory path1 = new address[](2);
		path1[0] = weth;
		path1[1] = usdtAddress;

		uint[] memory ethOut = IUniswapV2Router02(routerAddress).getAmountsOut(sqtIn, path0);
		uint[] memory usdtOut = IUniswapV2Router02(routerAddress).getAmountsOut(ethOut[1], path1);

		return usdtOut[1];
	}

	function swapMarketingTaxesForETH() public {
		ISQT sqt = ISQT(sqtAddress);
		require(sqt.admins(msg.sender) == true || msg.sender == owner, 'Not allowed');
		address marketingWallet = sqt.marketingWallet();
		uint balance = sqt.balanceOf(marketingWallet);

		require(balance >= 0, 'Not enough balance in marketing wallet');

		sqt.approveMarketingWallet(balance);
		sqt.transferFrom(marketingWallet, address(this), balance);

		address[] memory path = new address[](2);
		path[0] = sqtAddress;
		path[1] = weth;

		(uint marketingAmountSqt, uint liquidityAmountSqt) = getSplittedTaxes(balance);

		swapTokenForToken(marketingAmountSqt, path, marketingWallet);
		uint liquidityAmountEth = swapTokenForToken(liquidityAmountSqt / 2, path, address(this));
	
		sqt.approve(routerAddress, liquidityAmountSqt / 2);

		IUniswapV2Router02(routerAddress).addLiquidityETH{value:liquidityAmountEth}(
			path[0],
			liquidityAmountSqt / 2,
			0,
			liquidityAmountEth,
			owner,
			block.timestamp
		);
	}

	function swapRewardTaxesForETH(uint amountIn) private returns(uint amountOut) {
		ISQT sqt = ISQT(sqtAddress);
		address rewardWallet = sqt.rewardWallet();

		require(sqt.balanceOf(rewardWallet) >= amountIn, 'Not enough balance in reward wallet');

		sqt.approveRewardWallet(amountIn);
		sqt.transferFrom(rewardWallet, address(this), amountIn);

		address[] memory path = new address[](2);
		path[0] = sqtAddress;
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
		require(rewardToken0 != sqtAddress && rewardToken1 != sqtAddress, 'No SQT as reward');

		uint lastClaim = lastClaims[msg.sender];

		if (lastClaim == 0) {
			lastClaims[msg.sender] = now;
		} else {
			uint hoursDiff = (now - lastClaim) / 1 minutes;
			require(hoursDiff >= 3, 'You can only claim once per 3 mins');
			lastClaims[msg.sender] = now;
		}

		ISQT sqt = ISQT(sqtAddress);

		uint userBalance = sqt.balanceOf(msg.sender);

		require(userBalance > 0, 'No SQT balance');
		uint rewardSqtBalance = sqt.balanceOf(sqt.rewardWallet());

		if (rewardSqtBalance > 0) {
			uint userReward = countSqtReward(msg.sender);
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
		ISQT(sqtAddress).setTaxEnabled(false);
		IUniswapV2Pair(pair).transferFrom(msg.sender, address(this), liquidity);
		IUniswapV2Pair(pair).approve(routerAddress, liquidity);
		IUniswapV2Router02(routerAddress).removeLiquidityETH(sqtAddress, liquidity, amountTokenMin, amountETHMin, to, block.timestamp);
		ISQT(sqtAddress).setTaxEnabled(true);
	}
}
