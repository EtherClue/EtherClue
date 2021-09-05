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

const BigInt 			= require("big-integer");
const StorageHelper 	= require("etherclue-helpers/StorageHelper");
// ---------------------------------------------------------------------------------------

/**
 * Manual reentrancy IoC detector for HoneyPot smart contract. This version will check 
 * the change in balance from the transaction previous state and post state and then 
 * compare with actual change in the storage variable balance and see if they match. If 
 * these do not match than a reentrancy IoC is flagged.
 */
class IoCDetector_HoneyPot_01 {
	constructor(contract){
		this.contract = contract;
		this.storageIds = [];
		this.ext = [];
	}
}

// ---------------------------------------------------------------------------------------

/**
 * Returns true if IoC detected; otherwise false.
 *
 * @return True if IOC detected; otherwise false.
 *
 */
IoCDetector_HoneyPot_01.prototype.consider = 
		function(blockNumber, txs, accounts, blockBefore, blockAfter){

	var _self = this;

	var accountsTotalBefore = BigInt(0);
	var accountsTotalAfter = BigInt(0);

	var caBalanceBefore	= BigInt(blockBefore["alloc"][this.contract]["balance"]);
	var caBalanceAfter	= BigInt(blockAfter["alloc"][this.contract]["balance"]);

	var storageBefore	= blockBefore["alloc"][this.contract]["storage"];
	var storageAfter	= blockAfter["alloc"][this.contract]["storage"];

	// Count the total accounts total.
	var value;
	var storageIds = accounts[0].storage;
	storageIds.forEach(function(storageId){
		try{
			value = BigInt(storageBefore[storageId].slice(2), 16);
			accountsTotalBefore = accountsTotalBefore.add(value);

			value = BigInt(storageAfter[storageId].slice(2), 16);
			accountsTotalAfter = accountsTotalAfter.add(value);			
		}
		catch(err){ console.log(err); }
	});

	//console.log("accountsTotalBefore = " + accountsTotalBefore);
	//console.log("caBalanceBefore =" + caBalanceBefore);
	//console.log("accountsTotalAfter = " + accountsTotalAfter);
	//console.log("caBalanceAfter = " + caBalanceAfter);
	
	var diffA = accountsTotalAfter.subtract(accountsTotalBefore);
	var diffB = caBalanceAfter.subtract(caBalanceBefore);
	
	//console.log("diffA = " + diffA);
	//console.log("diffB = " + diffB);

	// If actual balance different is not as expected than this is an IoC for the
	// reentrancy vulnerablity class.
	if(diffA.neq(diffB)){
		_self.ext[blockNumber] = "Reentrancy, balance expected to change by " +
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
IoCDetector_HoneyPot_01.prototype.storage = function(txs){

	// Helper class used to calculate mapping key value.
	var storageHelper = new StorageHelper();

	// Result to be returned.
	var storageIds = [];
	
	// Retrieve all transaction senders.
	txs.forEach(function(tx){
		storageIds.push(storageHelper.mappingEntryId(tx.from, 0));
	})

	// Return result.
	return storageIds;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns name of IoC detected.
 *
 * @return Name of IoC detected.
 *
 */
IoCDetector_HoneyPot_01.prototype.getIoCName = function(){ 
	return "HoneyPot (1)"; 
}

// ---------------------------------------------------------------------------------------

/**
 * Return extra information on block.
 *
 * @return Extra information on block.
 *
 */
IoCDetector_HoneyPot_01.prototype.getExtInfo = function(hash){ 
	return this.ext[hash];
}

// ---------------------------------------------------------------------------------------
	
module.exports = IoCDetector_HoneyPot_01;
