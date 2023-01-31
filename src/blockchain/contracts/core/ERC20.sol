// // SPDX-License-Identifier: MIT

// pragma solidity >=0.6.0 <0.8.0;

// import "@openzeppelin/contracts/GSN/Context.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";
// import "../periphery/interfaces/IUniswapV2Router02.sol";

// import "hardhat/console.sol";

// contract ERC20 is Context, IERC20 {
//     using SafeMath for uint256;
//     event TransferTaxes(address indexed from, address indexed to, uint256 value);
//     mapping (address => uint256) private _balances;

//     mapping (address => mapping (address => uint256)) private _allowances;

//     uint256 private _totalSupply;

//     string private _name;
//     string private _symbol;
//     uint8 private _decimals;
//     address private rewardWallet;
//     address private marketingWallet;
//     address private sqnetRouter;
//     address private weth;
//     bool private taxEnabled = true;

//     constructor (string memory name_, string memory symbol_, address _marketingWallet, address _rewardWallet, address _sqnetRouter, address _weth) public {
//         _name = name_;
//         _symbol = symbol_;
//         _decimals = 18;
//         marketingWallet = _marketingWallet;
//         rewardWallet = _rewardWallet;
//         sqnetRouter = _sqnetRouter;
//         weth = _weth;
//     }

//     function name() public view returns (string memory) {
//         return _name;
//     }

//     function setTaxEnabled(bool status) public {
//         taxEnabled = status;
//     }

//     function symbol() public view returns (string memory) {
//         return _symbol;
//     }

//     function decimals() public view returns (uint8) {
//         return _decimals;
//     }

//     function totalSupply() public view override returns (uint256) {
//         return _totalSupply;
//     }

//     function balanceOf(address account) public view override returns (uint256) {
//         return _balances[account];
//     }

//     function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
//         _transfer(_msgSender(), recipient, amount);
//         return true;
//     }

//     function allowance(address owner, address spender) public view virtual override returns (uint256) {
//         return _allowances[owner][spender];
//     }

//     function approve(address spender, uint256 amount) public virtual override returns (bool) {
//         _approve(_msgSender(), spender, amount);
//         return true;
//     }

//     function handleTaxes(address sender, uint256 amount) internal returns(uint amountAfterTaxes) {
//         uint marketingWalletTax = amount * 3 / 100;
//         uint rewardWalletTax = amount * 6 / 100;

//         if (taxEnabled) {
//             address[] memory path = new address[](2);
//             path[0] = address(this);
//             path[1] = weth;

//             _approve(address(this), sqnetRouter, marketingWalletTax + rewardWalletTax);
//             ISQNETRouter(sqnetRouter).swapExactTokensForETH(marketingWalletTax, 0, path, marketingWallet, block.timestamp);
//         }

//         // transferTaxesFromFrom(sender, marketingWallet, marketingWalletTax);
//         // transferTaxes(sender, rewardWallet, rewardWalletTax);

//         amountAfterTaxes = amount - marketingWalletTax - rewardWalletTax;
//     }

//     function transferTaxesFrom(address sender, address recipient, uint amount) internal {
//         require(sender != address(0), "ERC20: transfer from the zero address");
//         require(recipient != address(0), "ERC20: transfer to the zero address");
//         changeBalanceOnTransfer(sender, recipient, amount);
//         emit TransferTaxes(sender, recipient, amount);
//     }

//     function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
//         _beforeTokenTransferFrom(sender, recipient, amount);
//         _transfer(sender, recipient, amount);
//         _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
//         return true;
//     }

//     function decreaseAllowanceAfterTransferFrom(address sender, uint amount) internal {
//         _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
//     }

//     function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
//         _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
//         return true;
//     }

//     function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
//         _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
//         return true;
//     }

//     function _transfer(address sender, address recipient, uint256 amount) internal virtual {
//         require(sender != address(0), "ERC20: transfer from the zero address");
//         require(recipient != address(0), "ERC20: transfer to the zero address");
//         _beforeTokenTransfer(sender, recipient, amount);
//         uint amountAfterTaxes = handleTaxes(sender, amount);
//         changeBalanceOnTransfer(sender, recipient, amountAfterTaxes);
//         emit Transfer(sender, recipient, amountAfterTaxes);
//     }

//     function changeBalanceOnTransfer(address sender, address recipient, uint amount) internal {
//         _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
//         _balances[recipient] = _balances[recipient].add(amount);
//     }

//     function _mint(address account, uint256 amount) internal virtual {
//         require(account != address(0), "ERC20: mint to the zero address");

//         _beforeTokenTransfer(address(0), account, amount);

//         _totalSupply = _totalSupply.add(amount);
//         _balances[account] = _balances[account].add(amount);
//         emit Transfer(address(0), account, amount);
//     }

//     function _burn(address account, uint256 amount) internal virtual {
//         require(account != address(0), "ERC20: burn from the zero address");

//         _beforeTokenTransfer(account, address(0), amount);

//         _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
//         _totalSupply = _totalSupply.sub(amount);
//         emit Transfer(account, address(0), amount);
//     }

//     function _approve(address owner, address spender, uint256 amount) internal virtual {
//         require(owner != address(0), "ERC20: approve from the zero address");
//         require(spender != address(0), "ERC20: approve to the zero address");
//         _allowances[owner][spender] = amount;
//         emit Approval(owner, spender, amount);
//     }

//     function _setupDecimals(uint8 decimals_) internal {
//         _decimals = decimals_;
//     }

//     function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual { }

//     function _beforeTokenTransferFrom(address from, address to, uint256 amount) internal virtual { }
// }
