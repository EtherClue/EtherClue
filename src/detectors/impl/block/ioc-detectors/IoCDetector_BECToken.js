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

// ---------------------------------------------------------------------------------------

const BigInt 	= require("big-integer");
const LogEntry 	= require("etherclue-helpers/LogEntry");
const Address 	= require("etherclue-helpers/Address");
const StorageHelper = require("etherclue-helpers/StorageHelper");

// ---------------------------------------------------------------------------------------

/**
 * 
 */
class IoCDetector_BECToken {
	constructor(contract){
		this.contract = contract;
		this.ext = [];
		this.DidLCClose = "Transfer(address,address,uint256)";
	}
}

// ---------------------------------------------------------------------------------------

/**
 *
 */
IoCDetector_BECToken.prototype.consider = 
		function(blockNumber, txs, accounts, blockBefore, blockAfter){

	var _self = this;

	// Accessed channels.
	var channels = [];

	var ioc = false;

	// Loop through all txs.
	txs.forEach(function(tx){

		// Check if tx was successfull.
		if(tx.receipt.status == true){
			// Loop through all log entries in tx receipt.
			tx.receipt.logs.forEach(function(entry1){

				// Stop further processing if ioc was found.
				if(ioc) { return; }

				// Use LogEntry helper class.
				var logEntry1 = new LogEntry(entry1);

				// If log entry from our contract account.
				if(logEntry1.isFrom(_self.contract)){
					// If log entry of expected type.
					
					//console.log(logEntry.ofType(_self.DidLCClose));
					if(logEntry1.ofType(_self.DidLCClose)){

						if(logEntry1.paramAt(0) == "0x8000000000000000000000000000000000000000000000000000000000000000"){
							
							console.log(" * Found 1st log entry with expected parameter at position 0.");

							// Searching for another instance of this log entry.
							tx.receipt.logs.forEach(function(entry2){

								// Stop further processing if ioc was found.
								if(ioc) { return; }

								// Use LogEntry helper class.
								var logEntry2 = new LogEntry(entry2);

								// Do not check if log entry not from this contract.
								if(!logEntry2.isFrom(_self.contract)){ return; }

								// Do not check if log entry not of expected type.
								if(!logEntry2.ofType(_self.DidLCClose)){ return; }

								// Do not check if log entry is same as already found.
								if(logEntry1.raw()['logIndex'] == logEntry2.raw()['logIndex']) { return; }
								
								// Start check.
								if(logEntry2.paramAt(0) == "0x8000000000000000000000000000000000000000000000000000000000000000"){

									console.log(" * Found 2nd log entry with expected parameter at position 0.");

									if(logEntry1.raw()['topics'][1] == logEntry2.raw()['topics'][1]){

										console.log(" * Both log entries have same source address.");
										console.log(logEntry1);
										console.log(logEntry2);

										_self.ext[blockNumber] = "index="+logEntry1.raw()['logIndex'];
										ioc = true;
										
										return;								
									}
								}
							});
						}
					}
				}
			});
		}
	});

	return ioc; // No IoC detected.
}	

// ---------------------------------------------------------------------------------------

/**
 * Returns storage addresses to be returned from blockchain for target contract.
 *
 * @return An array of account addresses and storage information.
 *
 */
IoCDetector_BECToken.prototype.storage = function(txs){

	// Reference to self.
	var _self = this;

	// Return wanted storage space values.
	return [];
}

// ---------------------------------------------------------------------------------------

/**
 * Returns name of IoC detected.
 *
 * @return Name of IoC detected.
 *
 */
IoCDetector_BECToken.prototype.getIoCName = function(){ 
	return "BECToken"; 
}


// ---------------------------------------------------------------------------------------

/**
 * Return extra information on block.
 *
 * @return Extra information on block.
 *
 */
IoCDetector_BECToken.prototype.getExtInfo = function(hash){ 
	return this.ext[hash];
}

// ---------------------------------------------------------------------------------------
	
module.exports = IoCDetector_BECToken;
