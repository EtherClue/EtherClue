// Example from; https://medium.com/@gus_tavo_guim/4470a2d8dfe4
// Updated to solidity version 0.5.8
pragma solidity >=0.5.8;
contract HoneyPot {
	mapping (address => uint) public balances;
	constructor() public payable {
		put();
	}  
	function put() public payable {
		balances[msg.sender] += msg.value;
	}  
	function get() public {
		(bool b,) = msg.sender.call.value(balances[msg.sender])("");
		if (!b) {
			revert();
		}
		balances[msg.sender] = 0;
	}  
	function() external {
		revert();
	}
}