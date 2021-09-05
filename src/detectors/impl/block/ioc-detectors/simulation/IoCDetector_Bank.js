/*
 * Copyright 2021, Simon Joseph Aquilina
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// --------------------------------------------------------------------------------------

/**
 * @author      Simon Joseph Aquilina
 * @version     2.1
 * @since		1.0
 */

// --------------------------------------------------------------------------------------

const BigInt 	= require("big-integer");
const LogEntry 	= require("etherclue-helpers/LogEntry");
const Address 	= require("etherclue-helpers/Address");
const StorageHelper = require("etherclue-helpers/StorageHelper");

// ---------------------------------------------------------------------------------------

/**
 * 
 */
class IoCDetector_Bank_02 {
	constructor(contract){
		this.contract = contract;
		this.ext = [];
		this.bankDepositSig 	= "bankDeposit(address,uint256)";
		this.bankWithdrawalSig 	= "bankWithdrawal(address,uint256)";
	}
}

// ---------------------------------------------------------------------------------------

/**
 * Returns true if IoC detected; otherwise false. Note an IoC for the bank account can 
 * be the result of an underflow, overflow or reentrancy. 
 * 
 * @return True if IOC detected; otherwise false.
 *
 */
IoCDetector_Bank_02.prototype.consider = 
		function(blockNumber, txs, accounts, blockBefore, blockAfter){

	var _self = this;

	var accountsTotalBefore	= BigInt(0);
	var accountsTotalAfter	= BigInt(0);

	// Get balance in previous and post state. Note this IoC pattern does not
	// consider ether changes as a result of an admin function call. If such admin
	// functions are to be considered then emit an event for when ether is moved
	// in and out and consider this when calculating ether changes.
	var caBalanceBefore	= BigInt(blockBefore["alloc"][this.contract]["balance"]);
	var caBalanceAfter	= BigInt(blockAfter["alloc"][this.contract]["balance"]);

	// Get storage state from previous and post state.
	var storageBefore	= blockBefore["alloc"][this.contract]["storage"];
	var storageAfter	= blockAfter["alloc"][this.contract]["storage"];

	// Count balance of effected accounts in pre and post state.
	var value;
	var storageIds = accounts[0].storage;
	storageIds.forEach(function(storageId, index){
		try{
			value = BigInt(storageBefore[storageId].slice(2), 16);
			accountsTotalBefore = accountsTotalBefore.add(value);
			//console.log("Value Before: " + value.toString(10));
			//console.log("Total Before: " + accountsTotalBefore.toString(10));

			value = BigInt(storageAfter[storageId].slice(2), 16);
			accountsTotalAfter = accountsTotalAfter.add(value);			
			//console.log("Value After: " + value.toString(10));
			//console.log("Total After: " + accountsTotalAfter.toString(10));
		}
		catch(err){console.log(err);}
	});	

	/*
	console.log("accountsTotalBefore = " + accountsTotalBefore);
	console.log("caBalanceBefore =" + caBalanceBefore);
	// Loop through all txs.
	txs.forEach(function(tx){
		// Check if tx was successfull.
		if(tx.receipt.status == true){
			// Loop through all log entries in tx receipt.
			tx.receipt.logs.forEach(function(entry){
				// Use LogEntry helper class.
				var logEntry = new LogEntry(entry);
				// If log entry from our contract account.
				if(logEntry.isFrom(_self.contract)){
					// If log entry of expected type.
					if(logEntry.ofType(_self.bankDepositSig)){
						// Add address to retrieve storage space value.
						var address = new Address(logEntry.paramAt(0));
						console.log("" + address.toString() + " deposit " + BigInt(logEntry.paramAt(1)).toString(10));
					}
					if(logEntry.ofType(_self.bankWithdrawalSig)){
						// Add address to retrieve storage space value.
						var address = new Address(logEntry.paramAt(0));
						console.log("" + address.toString() + " withdraw " + BigInt(logEntry.paramAt(1)).toString(10));
					}
				}
			});
		}
	});
	console.log("accountsTotalAfter = " + accountsTotalAfter);
	console.log("caBalanceAfter = " + caBalanceAfter);
	*/
	
	var diffA = accountsTotalAfter.subtract(accountsTotalBefore);
	var diffB = caBalanceAfter.subtract(caBalanceBefore);
	
	//console.log("diffA = " + diffA);
	//console.log("diffB = " + diffB);

	// An IoC in this case is the balance difference from the pre to post state being
	// difference thant the balance change between the effected accounts. 
	if(diffA.neq(diffB)){
		_self.ext[blockNumber] = "Balance expected to change by " +
			diffA.toString(10) + " but instead changed by " + diffB.toString(10);
		return true; // IoC detected.
	}

	return false; // No IoC detected.
}	

// ---------------------------------------------------------------------------------------

/**
 * Returns storage addresses to be returned from blockchain for target contract.
 *
 * @return An array of account addresses and storage information.
 *
 */
IoCDetector_Bank_02.prototype.storage = function(txs){

	// Reference to self.
	var _self = this;

	// Store all storage ids we are intrested in.
	var storageIds = [];

	// Helper class to calculate storage space ids.
	var storageHelper = new StorageHelper()

	// Loop through all txs.
	txs.forEach(function(tx){
		// Check if tx was successfull.
		if(tx.receipt.status == true){
			// Loop through all log entries in tx receipt.
			tx.receipt.logs.forEach(function(entry){
				// Use LogEntry helper class.
				var logEntry = new LogEntry(entry);
				// If log entry from our contract account.
				if(logEntry.isFrom(_self.contract)){
					// If log entry of expected type.
					if(logEntry.ofType(_self.bankDepositSig) ||
						logEntry.ofType(_self.bankWithdrawalSig)){
							// Add address to retrieve storage space value.
							var address = new Address(logEntry.paramAt(0));
							var entry = storageHelper.mappingEntryId(address.toString(), 0);
							if(!storageIds.includes(entry)){
								//console.log(entry);
								storageIds.push(entry);
							}
					}
				}
			});
		}
	});

	// Return wanted storage space values.
	return storageIds;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns name of IoC detected.
 *
 * @return Name of IoC detected.
 *
 */
IoCDetector_Bank_02.prototype.getIoCName = function(){ 
	return "Bank"; 
}


// ---------------------------------------------------------------------------------------

/**
 * Return extra information on block.
 *
 * @return Extra information on block.
 *
 */
IoCDetector_Bank_02.prototype.getExtInfo = function(hash){ 
	return this.ext[hash];
}

// ---------------------------------------------------------------------------------------
	
module.exports = IoCDetector_Bank_02;
