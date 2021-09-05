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
const StorageHelper 	= require("etherclue-helper/StorageHelper");

// ---------------------------------------------------------------------------------------

class IoCDetector_SimulationKotET {
	constructor(contract){
		this.contract = contract;
		this.storageIds = [];
		this.ext = [];
	}
}

// ---------------------------------------------------------------------------------------

IoCDetector_SimulationKotET.prototype.consider = 
		function(blockNumber, txs, accounts, blockBefore, blockAfter){

	// Get balance before and balance after.
	var balanceBefore	= BigInt(blockBefore["alloc"][this.contract]["balance"]);
	var balanceAfter	= BigInt(blockAfter["alloc"][this.contract]["balance"]);

	// If balance is not the same then (in our version of KotET) this means that
	// one of the send's has not worked an ether is now stuck on the contract account.
	// On the real KotET this check would need to be enhanced based on the it actual
	// logic so that the balance difference can be calculated.
	if(balanceBefore.lt(balanceAfter)){
		var diff = balanceAfter.minus(balanceBefore);
		this.ext[blockNumber] = "" + diff.toString(10) +
			" wei stuck on contract account";
		return true; // IoC detected.
	}

	return false; // No IoC detected.
}	

// ---------------------------------------------------------------------------------------

IoCDetector_SimulationKotET.prototype.storage = function(txs){

	return [];
}

// ---------------------------------------------------------------------------------------

IoCDetector_SimulationKotET.prototype.getIoCName = function(){ 
	return "KotET"; 
}

// ---------------------------------------------------------------------------------------

IoCDetector_SimulationKotET.prototype.getExtInfo = function(hash){ 
	return this.ext[hash];
}

// ---------------------------------------------------------------------------------------
	
module.exports = IoCDetector_SimulationKotET;
