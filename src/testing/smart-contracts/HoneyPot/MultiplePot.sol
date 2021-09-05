pragma solidity >=0.5.8;
import "./HoneyPot.sol";
contract MultiplePots {
	HoneyPot public honeypot = HoneyPot(0xcDC7164180454CD875D49B9cAcE941C46ca48F47);  
	address payable owner;
	mapping (uint => uint) public balances;
	constructor() public{
	    owner = msg.sender;
	}
	function put(uint potId) public payable {
		balances[potId] += msg.value;
		honeypot.put.value(msg.value)();
	}  
	function get(uint potId) public {
	    uint amount = balances[potId];
	    honeypot.get();
	    owner.transfer(amount);
	    balances[potId] = 0;
	    honeypot.put.value(address(this).balance)();
	}  
	function () external payable {}
}