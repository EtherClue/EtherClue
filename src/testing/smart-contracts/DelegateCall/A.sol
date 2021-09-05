pragma solidity >=0.5.8;
contract A {
	
	// Store number of calls.
	uint public calls;

	// Event.
	event called(address from, uint id);
	
	// Allow third party accounts to deposit ether with the bank.
	function doSomething() public payable {
		address("<put B address here>").delegateCall(abi.encodeWithSignature("handlecall()", msg.sender));
		emit called(msg.sender, calls);
	}

}