// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./MyERC20.sol";

contract ExchangeableToken is MyERC20 {
    string public name = "My Exchange Token";
    string public symbol = "EX";
    uint256 private _rate;
    uint256 private constant _base = 1;

    constructor() MyERC20() {
        _rate = _base;
    }

    function managerAddress() public view returns (address) {
        return address(this);
    }

    function estimateNumOfToken(uint256 amount) public pure returns (uint256) {
        return amount;// (amount * _rate / _base);
    }

    function estimateNativeCoin(uint256 amount) public pure returns (uint256) {
        return amount;//(amount * _base / _rate);
    }

    event ExchangeTransfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    function mint(uint256 amount) public payable returns (bool success) {
        require(amount > 0,"The amount must be greater than 0");
        uint256 num_of_tokens = estimateNumOfToken(amount);
        require(num_of_tokens > 0,"Number of tokens must be greater than 0");
        uint256 purchase = estimateNativeCoin(num_of_tokens);
        payable(_contractOwner).transfer(purchase);
        _mint(msg.sender, num_of_tokens);
        unchecked{
            if(msg.value - purchase > 0){
                payable(msg.sender).transfer(msg.value - purchase);
            }
        }
        return true;
    }

    receive() external payable {
        mint(msg.value);
    }

    function exchange(address to, uint256 amount)
        public
        payable
        returns (bool success)
    {
        require(amount > 0,"The amount must be greater than 0");
        mint(amount);
        _burn(msg.sender, amount);
        emit ExchangeTransfer(msg.sender, to, amount);
        return true;
    }

    function withdraw(address to, uint256 amount)
        public
        payable
        returns (bool success)
    {
        require(amount > 0,"The amount must be greater than 0");
        uint256 balance = balanceOf(msg.sender);
        require(balance >= amount,"amount must be less than balance");
        _burn(msg.sender, amount);
        uint256 purchase = estimateNativeCoin(amount);
        require(msg.value >= purchase,"msg.value must be greater than purchase");
        payable(to).transfer(purchase);
        unchecked{
            if(msg.value - purchase > 0){
                payable(msg.sender).transfer(msg.value - purchase);
            }
        }
        return true;
    }

    function deposit(address to, uint256 amount) external {
        require(msg.sender == _contractOwner);
        _mint(to, amount);
    }
}
