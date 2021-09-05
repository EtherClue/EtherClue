pragma solidity >=0.5.8;
contract B {

	// Placeholder.
	uint public calls;

	// Handle call and send result to original caller.
	function handlecall(address ret) public {
		calls = calls + 1;
		address(ret).call(abi.encodeWithSignature("accept()", calls));
	}
}