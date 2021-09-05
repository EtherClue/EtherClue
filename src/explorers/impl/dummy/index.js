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

// ---------------------------------------------------------------------------------------

/**
 * @author      Simon Joseph Aquilina
 * @version     2.0
 * @since		2.0
 */

// ---------------------------------------------------------------------------------------

/**
 * Template to create a blockchain explorer interface.
 */
class DummyExplorer {
	constructor(options){
		this.logger = options.logger;
	}
}

// ---------------------------------------------------------------------------------------

/**
 * Return transaction details for the given transaction hash.
 * 
 * @param txHash	Transaction hash.
 * @returns Transaction details.
 */
DummyExplorer.prototype.txDetails = async function(txHash){
	this.logger.logInfo("This is the dummy explorer. " + 
			"The txDetails function has been called.");
	return null;
}

// ---------------------------------------------------------------------------------------

/**
 * Return transaction receipt for the given transaction hash.
 * 
 * @param txHash	Transaction hash.
 * @returns Transaction receipt.
 */
DummyExplorer.prototype.txReceipt = async function(txHash){
	this.logger.logInfo("This is the dummy explorer. " + 
			"The txReceipt function has been called.");	
	return null;
}

// ---------------------------------------------------------------------------------------

/**
 * Return transaction trace for the given transaction hash.
 *
 * @param txhash	Transaction hash.
 * @param config 	Additional configuration (see Geth debug_traceTransaction 
 * 					documation).
 * @returns	Transaction trace.
 */
DummyExplorer.prototype.txTrace = async function(txhash, config){
	this.logger.logInfo("This is the dummy explorer. " + 
			"The txTrace function has been called.");		
	return null;
}

// ---------------------------------------------------------------------------------------

/**
 * Return block trace for the given block number.
 * 
 * @param blockNumber	Block number.
 * @param config 	 	Additional configuration (see Geth debug_traceTransaction 
 * 						documation).
 * @returns Block trace.
 */
DummyExplorer.prototype.blockTrace = async function(blockNumber, config){
	this.logger.logInfo("This is the dummy explorer. " + 
			"The blockTrace function has been called.");		
	return null;
}

// ---------------------------------------------------------------------------------------

/**
 * Return balance of an account at the given address at the given block number.
 * 
 * @param address 		Account address.
 * @param blockNumber 	Block number.
 * @returns The balance of the given account address at the given block number.
 */
DummyExplorer.prototype.getBalanceAt = async function(address, blockNumber){
	this.logger.logInfo("This is the dummy explorer. " + 
			"The getBalanceAt function has been called.");		
	return null;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns the storage value of an account at the given block number.
 * @param address 		Account address.
 * @param storageId 	Storage Id.
 * @param blockNumber 	Block number.
 * @returns The storage value of an account at the given block number.
 */
DummyExplorer.prototype.getStorageAt = async function(address, storageId, blockNumber){
	this.logger.logInfo("This is the dummy explorer. " + 
			"The getStorageAt function has been called.");	
	return null;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns the name of this blockchain explorer interface.
 * 
 * @returns The name of this blockchain explorer interface.
 */
DummyExplorer.prototype.toString = async function(){
	return "DummyExplorer";
}

// ---------------------------------------------------------------------------------------

module.exports = DummyExplorer;

// ---------------------------------------------------------------------------------------
