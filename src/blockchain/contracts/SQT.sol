pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "hardhat/console.sol";

contract SQT is Context, IERC20 {
  using SafeMath for uint256;

  mapping (address => uint256) private _balances;
  mapping(address => bool) minters;
  mapping(address => bool) public admins;
  mapping (address => mapping (address => uint256)) private _allowances;

  uint private numTokens = 1e12;
  uint private MARKETING_TAX = 3;
  uint private REWARD_TAX = 6;
  uint private LIQUIDITY_TAX = 1;

  uint256 private _totalSupply;
  string private _name;
  string private _symbol;
  uint8 private _decimals = 18;
  bool private taxEnabled = true;
  address public owner;
  address private _rewardWallet;
  address private _marketingWallet;
  address private sqnetAddress;

  event TransferTaxes(address indexed from, address indexed to, uint256 value);

  constructor(
    string memory name_, 
    string memory symbol_,
    address marketingWallet_, 
    address rewardWallet_
  ) public {
    _name = name_;
    _symbol = symbol_;
    owner = msg.sender;
    _marketingWallet = marketingWallet_;
    _rewardWallet = rewardWallet_;
    setAdmin(msg.sender, true);
    setMinter(msg.sender, true);
    _mint(msg.sender, numTokens * (10 ** uint256(decimals())));
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only owner');
    _;
  }

  modifier onlyMinter() {
    require(minters[msg.sender] == true, 'Only minter');
    _;
  }

  modifier onlyAdmin() {
    require(admins[msg.sender] == true, 'Only admin');
    _;
  }

  function transferOwnership (address _address) public onlyOwner {
		owner = _address;
	}

  function setSqnetAddress(address _address) public onlyOwner {
    setAdmin(sqnetAddress, false);
    sqnetAddress = _address;
    setAdmin(sqnetAddress, true);
  }

  function getMarketingTax() public returns(uint) {
    return MARKETING_TAX;
  }

  function getRewardTax() public returns(uint) {
    return REWARD_TAX;
  }

  function getLiquidityTax() public returns(uint) {
    return LIQUIDITY_TAX;
  }

  function marketingWallet() public returns(address) {
    return _marketingWallet;
  }

  function rewardWallet() public returns(address) {
    return _rewardWallet;
  }

  function setMarketingWallet(address _address) public onlyOwner {
    _marketingWallet = _address;
  }

  function setRewardWallet(address _address) public onlyOwner {
    _rewardWallet = _address;
  }

  function setTaxes(uint marketingTax, uint rewardTax, uint liquidityTax) public onlyOwner {
    MARKETING_TAX = marketingTax;
    REWARD_TAX = rewardTax;
    LIQUIDITY_TAX = liquidityTax;
  }

  function setMinter(address _address, bool status) public onlyAdmin {
    minters[_address] = status;
  }

  function setAdmin(address _address, bool status) public onlyOwner {
    admins[_address] = status;
  }

  function setTaxEnabled(bool status) public onlyAdmin {
    taxEnabled = status;
  }

  function handleTaxes(address sender, uint256 amount) internal returns(uint amountAfterTaxes) {
    uint marketingWalletTax = amount * (MARKETING_TAX + LIQUIDITY_TAX) / 100;
    uint rewardWalletTax = amount * REWARD_TAX / 100;
    transferTaxesFrom(sender, _marketingWallet, marketingWalletTax);
    transferTaxesFrom(sender, _rewardWallet, rewardWalletTax);
    amountAfterTaxes = amount - marketingWalletTax - rewardWalletTax;
  }

  function transferTaxesFrom(address from, address to, uint value) public returns (bool) {
    require(from != address(0), "ERC20: transfer from the zero address");
    require(to != address(0), "ERC20: transfer to the zero address");
    changeBalanceOnTransfer(from, to, value);
    emit TransferTaxes(from, to, value);
  }

  function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
    _transfer(sender, recipient, amount);
    _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
    return true;
  }

  function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
    _transfer(_msgSender(), recipient, amount);
    return true;
  }

  function _transfer(address sender, address recipient, uint256 amount) internal {
    require(sender != address(0), "ERC20: transfer from the zero address");
    require(recipient != address(0), "ERC20: transfer to the zero address");
    uint amountAfterTaxes;

    if (sender == _marketingWallet || sender == _rewardWallet || sender == owner || sender == sqnetAddress) {
      taxEnabled = false;
    }

    if (taxEnabled) {
      amountAfterTaxes = handleTaxes(sender, amount);
    } else {
      amountAfterTaxes = amount;
    }

    changeBalanceOnTransfer(sender, recipient, amountAfterTaxes);

    if (!taxEnabled) {
      taxEnabled = true;
    }

    emit Transfer(sender, recipient, amountAfterTaxes);
  }

  function changeBalanceOnTransfer(address sender, address recipient, uint amount) internal {
    _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
    _balances[recipient] = _balances[recipient].add(amount);
  }

  function name() public view returns (string memory) {
    return _name;
  }

  function symbol() public view returns (string memory) {
    return _symbol;
  }

  function decimals() public view returns (uint8) {
    return _decimals;
  }

  function totalSupply() public view override returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view override returns (uint256) {
    return _balances[account];
  }

  function allowance(address _owner, address spender) public view virtual override returns (uint256) {
    return _allowances[_owner][spender];
  }

  function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
    _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
    return true;
  }

  function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
    _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
    return true;
  }

  function approve(address spender, uint256 amount) public virtual override returns (bool) {
    _approve(_msgSender(), spender, amount);
    return true;
  }

  function approveMarketingWallet(uint amount) public {
    require(msg.sender == sqnetAddress, 'Only SQNET');
    _approve(_marketingWallet, sqnetAddress, amount);
  }

  function approveRewardWallet(uint amount) public {
    require(msg.sender == sqnetAddress, 'Only SQNET');
    _approve(_rewardWallet, sqnetAddress, amount);
  }

  function _approve(address _owner, address spender, uint256 amount) internal {
    require(_owner != address(0), "ERC20: approve from the zero address");
    require(spender != address(0), "ERC20: approve to the zero address");
    _allowances[_owner][spender] = amount;
    emit Approval(_owner, spender, amount);
  }

  function mint(address to, uint amount) public onlyMinter {
    require(to != address(0), 'Empty address');
    require(amount > 0, 'No amount');
    _mint(to, amount);
  }

  function _mint(address account, uint256 amount) internal {
    require(account != address(0), "ERC20: mint to the zero address");

    _totalSupply = _totalSupply.add(amount);
    _balances[account] = _balances[account].add(amount);
    emit Transfer(address(0), account, amount);
  }

  function _burn(address account, uint256 amount) internal {
    require(account != address(0), "ERC20: burn from the zero address");

    _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
    _totalSupply = _totalSupply.sub(amount);
    emit Transfer(account, address(0), amount);
  }

  function _setupDecimals(uint8 decimals_) internal onlyOwner {
    _decimals = decimals_;
  }
}