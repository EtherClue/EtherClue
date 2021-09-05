pragma solidity >=0.5.8;
contract SimulationKotET {

	uint public currentClaimPrice = 0;

	address payable public currentMonarch;

    /* Adaptation of the claimThrone function, original code here:
	 * 		https://github.com/kieranelby/KingOfTheEtherThrone/blob/v0.4.0/contracts/KingOfTheEtherThrone.sol
	 * Vulnerability is documented here:
	 *		https://www.kingoftheether.com/postmortem.html
	 */
    function claimThrone() public payable {

        uint valuePaid = msg.value;

        // If they paid too little, reject claim and refund their money.
		if (valuePaid < currentClaimPrice) {
    		msg.sender.send(valuePaid);				// problem here.
    		return;
		}

		// If they paid too much, continue with claim but refund the excess.
		if (valuePaid > currentClaimPrice) {
			uint excessPaid = valuePaid - currentClaimPrice;
			msg.sender.send(excessPaid);			// problem here.
			valuePaid = valuePaid - excessPaid;
		}

		// The claim price payment goes to the current monarch as compensation
		currentMonarch.send(currentClaimPrice);		// problem here.
		
		// Usurp the current monarch, replacing them with the new one.
		currentMonarch = msg.sender;

		// Increase the claim fee for next time.
		currentClaimPrice = currentClaimPrice * 2;
	}
	// 'problem here' shows line where call to send funds can fail and
	// the funds then remain stuck on the contract. Not to confuse with DoS
	// where the call is forced to fail by the caller to prevent the callee
	// from doing any further logic.
}