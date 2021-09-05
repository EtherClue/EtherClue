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
const Web3 		= require('web3');
// ---------------------------------------------------------------------------------------

/**
 * 
 */
class IoCDetector_DelayedUnderflow {
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
IoCDetector_DelayedUnderflow.prototype.consider = 
		function(blockNumber, txs, accounts, blockBefore, blockAfter){

			var _self = this;

			var result = false;

			var storageBefore	= blockBefore["alloc"][this.contract]["storage"];
			var storageAfter	= blockAfter["alloc"][this.contract]["storage"];

			// Count the total accounts total.
			var before, after;
			var storageIds = accounts[0].storage;
			storageIds.forEach(function(storageId){
				try{
					before = BigInt(storageBefore[storageId].slice(2), 16);
					after = BigInt(storageAfter[storageId].slice(2), 16);
					if(after.gt(before)){ 
						result = true; 
						_self.ext[blockNumber] = "Underflow Detected"; 
					}
				}
				catch(err){ console.log(err); }
			});		
	
			return result;
}	

// ---------------------------------------------------------------------------------------

/**
 * Returns storage addresses to be returned from blockchain for target contract.
 *
 * @return An array of account addresses and storage information.
 *
 */
IoCDetector_DelayedUnderflow.prototype.storage = function(txs){

	var storageIds = [0];
	return storageIds;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns name of IoC detected.
 *
 * @return Name of IoC detected.
 *
 */
IoCDetector_DelayedUnderflow.prototype.getIoCName = function(){ 
	return "DelayedUnderflow"; 
}


// ---------------------------------------------------------------------------------------

/**
 * Return extra information on block.
 *
 * @return Extra information on block.
 *
 */
IoCDetector_DelayedUnderflow.prototype.getExtInfo = function(hash){ 
	return this.ext[hash];
}

// ---------------------------------------------------------------------------------------
	
module.exports = IoCDetector_DelayedUnderflow;
