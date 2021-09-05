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
class IoCDetector_Calculator {
	constructor(contract){
		this.contract = contract;
		this.ext = [];
		this.subSig 	= "subtraction(uint256,uint256,uint256)";
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
IoCDetector_Calculator.prototype.consider = 
		function(blockNumber, txs, accounts, blockBefore, blockAfter){

	var _self = this;
	var ioc = false;

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
					if(logEntry.ofType(_self.subSig)){
						// Check if underflow has occured.
						//console.log(BigInt(logEntry.paramAt(0).slice(2),16));
						//console.log(BigInt(logEntry.paramAt(2).slice(2),16));
						if(BigInt(logEntry.paramAt(2).slice(2),16).gt(BigInt(logEntry.paramAt(0).slice(2),16))){
							_self.ext[blockNumber] = "underflow";
							ioc = true;
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
IoCDetector_Calculator.prototype.storage = function(txs){
	return [];
}

// ---------------------------------------------------------------------------------------

/**
 * Returns name of IoC detected.
 *
 * @return Name of IoC detected.
 *
 */
IoCDetector_Calculator.prototype.getIoCName = function(){ 
	return "Calculator"; 
}


// ---------------------------------------------------------------------------------------

/**
 * Return extra information on block.
 *
 * @return Extra information on block.
 *
 */
IoCDetector_Calculator.prototype.getExtInfo = function(hash){ 
	return this.ext[hash];
}

// ---------------------------------------------------------------------------------------
	
module.exports = IoCDetector_Calculator;
