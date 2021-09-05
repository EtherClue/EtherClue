pragma solidity >=0.5.8;
contract SimulationBECToken {
	mapping (address => uint) public balances;
	/* Copied from BECToken with minor amendments. *
	   Attack: 
	   		send two addresses and 
	   		_value = 57896044618658097711785492504343953926634992332820282019728792003956564819968
	   Balance for the two accounts will increase by this much.
	   There is no need for msg.sender to even have any balance. */
	function batchTransfer(address[] memory _receivers, uint256 _value) public {
		uint cnt = _receivers.length;
		uint256 amount = uint256(cnt) * _value;
		require(cnt > 0 && cnt <= 20);
		require(_value > 0 && balances[msg.sender] >= amount);
		balances[msg.sender] = balances[msg.sender].sub(amount);
		for (uint i = 0; i < cnt; i++) {
			balances[_receivers[i]] = balances[_receivers[i]].add(_value);
		}
	}
}
// Vulnerability documented here:
// https://blockchain-projects.readthedocs.io/overflow.html
// and here:
// https://medium.com/@yenthanh/prevent-integer-overflow-in-ethereum-smart-contracts-a7c84c30de66