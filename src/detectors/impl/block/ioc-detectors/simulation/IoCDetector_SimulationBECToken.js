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
const TxHelper 	= require("etherclue-helpers/TXAnalyser");
const StorageHelper = require("etherclue-helpers/StorageHelper");

// ---------------------------------------------------------------------------------------

/**
 * 
 */
class IoCDetector_SimulationBECToken {
	constructor(contract){
		this.contract = contract;
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
IoCDetector_SimulationBECToken.prototype.consider = 
		function(blockNumber, txs, accounts, blockBefore, blockAfter){

	var _self = this;

	var storageBefore	= blockBefore["alloc"][this.contract]["storage"];
	var storageAfter	= blockAfter["alloc"][this.contract]["storage"];

	var totalBefore = BigInt(0);
	var totalAfter = BigInt(0);

	var before, after;
	var storageIds = accounts[0].storage;
	storageIds.forEach(function(storageId, index){
		
		before = BigInt(storageBefore[storageId].slice(2), 16);
		after = BigInt(storageAfter[storageId].slice(2), 16);

		totalBefore = totalBefore.add(before);
		totalAfter = totalAfter.add(after);
	});

	//console.log("totalBefore: " + totalBefore.toString(10));
	//console.log("totalAfter : " + totalAfter.toString(10));
	//console.log(totalBefore.minus(totalAfter));
	if(totalBefore.neq(totalAfter)){
		_self.ext[blockNumber] = "Pre/Post State Invalid"; 
		return true;
	}
	return false;
}	

// ---------------------------------------------------------------------------------------

/**
 * Returns storage addresses to be returned from blockchain for target contract.
 *
 * @return An array of account addresses and storage information.
 *
 */
IoCDetector_SimulationBECToken.prototype.storage = function(txs){

	// Reference to self.
	var storageIds = [];

	// Helper class to calculate storage space ids.
	var storageHelper = new StorageHelper();

	// Add tx from to storage ids.

	// Loop through all txs.
	var entry;
	txs.forEach(function(tx){
		// Check if tx was successfull.
		if(tx.receipt.status == true){
		//console.log(tx.from);
		entry = storageHelper.mappingEntryId(new Address(tx.from).toString(), 0);
		if(!storageIds.includes(entry)){
			storageIds.push(entry);
		}
		// Use transaction helper to get parameter details.
		var txHelper = new TxHelper(tx);			
			try{ 
				var many = BigInt(txHelper.input().params[2].slice(2), 16);
				for(i = 0; i < many; i++){
					var a = txHelper.input().params[3 + i];
					var address = new Address(a);
					//console.log(address.toString());
					var entry = storageHelper.mappingEntryId(address.toString(), 0);
					if(!storageIds.includes(entry)){
						storageIds.push(entry);
					}
				}
			}
			catch(err){
				console.log("\nIMPORTANT: TX is not in expected format. Internal Message Call?\n");
			}
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
IoCDetector_SimulationBECToken.prototype.getIoCName = function(){ 
	return "BECToken"; 
}


// ---------------------------------------------------------------------------------------

/**
 * Return extra information on block.
 *
 * @return Extra information on block.
 *
 */
IoCDetector_SimulationBECToken.prototype.getExtInfo = function(hash){ 
	return this.ext[hash];
}

// ---------------------------------------------------------------------------------------
	
module.exports = IoCDetector_SimulationBECToken;
