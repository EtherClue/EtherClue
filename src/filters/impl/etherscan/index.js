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

const etherscanAPI	= require("etherscan-api");
const keccak256 	= require('keccak256');
const splitString 	= require('split-string');

// ---------------------------------------------------------------------------------------

const delay = ms => new Promise(res => setTimeout(res, ms));

// ---------------------------------------------------------------------------------------

/**
 * 
 */
class EtherscanFilter {
	constructor(options){

		this.logger = options.logger;

		this.apikey = options.apiKey;
		this.network = options.network;
		this.timeout = 5000;
		this.api = etherscanAPI.init(
			options.apikey, 	// Etherscan API Key.
			options.network, 	// Etherum Network.
			this.timeout);		// Timeout connection.	

		this.address = options.address;
		this.from = parseInt(options.from);
		this.to = parseInt(options.to);
		this.fs = options.fs;

		this.pageCount = 10000;
		this.retryCount = parseInt(options.retryCount);
		this.retryDelay = parseInt(options.retryDelay);
		this.blockCount = parseInt(options.blockCount);

		this.emc = options.emc;
		this.imc = options.imc;
		this.tx = options.tx;

		if(!options.emc){ this.emc = true; }
		if(!options.imc){ this.imc = true; }
		if(!this.retryCount){ this.retryCount = 15; }
		if(!this.retryDelay){ this.retryDelay = 500; }
		if(!this.blockCount){ this.blockCount = 100000; }				
	}
}

// ---------------------------------------------------------------------------------------

/**
 * 
 */
EtherscanFilter.prototype.txList = async function(){

	if(this.tx){
		this.logger.logInfo("Retrieve block number for transaction " + this.tx + "...");
		var txDetails = await this.api.proxy.eth_getTransactionByHash(this.tx);
		var txs = [];
		if(txDetails){
			txs.push(
				{
					blockNumber : txDetails.result.blockNumber,
					hash : this.tx,
				}
			);
		}
		return txs;
	}

	var emc = [], imc = [];

	if(this.emc == true){
		this.logger.logInfo("Retrieving external message calls...") ;		
		var emc = await this.synchronizeEMC(this.from, this.to);
		this.logger.logInfo("Retrieved " + emc.length + " external message calls.");
	}

	if(this.fs){
		this.logger.logInfo("Apply function select logic...");
		var many = emc.length;
		emc = await this.applyFunctionSelect(emc);
		this.logger.logInfo("Filtered out " + (many - emc.length) + " transactions.");
		this.logger.logInfo("There are " + emc.length + " transactions left.");		
	}

	if(this.imc == true){
		this.logger.logInfo("Retrieving internal message calls...") ;		
		var imc = await this.synchronizeIMC(this.from, this.to);
		this.logger.logInfo("Retrieved " + imc.length + " internal message calls.");
	}

	this.logger.logInfo("Loaded " + (emc.length + imc.length) + " message calls.");

	if((emc.length + imc.length) == 0) { return [] }
	
	this.logger.logInfo("Flattening message calls to unique transactions...");
	var txs = await this.flattenTxList(emc, imc);
	this.logger.logInfo("Flattened to " + txs.length + " unique transactions.");	

	return txs;
}
// ---------------------------------------------------------------------------------------

EtherscanFilter.prototype.toString = async function(){
	return "EtherscanFilter";
}

// ---------------------------------------------------------------------------------------

EtherscanFilter.prototype.synchronizeEMC = async function(fromBlock, toBlock){

	var emc = [];
	
	// Check that we do not try get more blocks than we require.
	var blockCount = this.blockCount;
	var range = toBlock - fromBlock;
	if(range < blockCount){ blockCount = range; }
	
	// Set the max block size.
	var maxBlockCount = blockCount;
	
	for(	bif = fromBlock, 
			bit = bif + blockCount, 
			bit > toBlock ? bit = toBlock : bit = bit
												; 
			bif <= toBlock
												; 
			bif = bit + 1, bit = bit + blockCount
	){
		if(bit > toBlock) { bit = toBlock; }
		var left = toBlock - bif;
		if(left < blockCount){ 
			blockCount = left; 
			this.logger.logInfo("Block range larger than required. Reduced block range to " + blockCount + ".");
		}
		this.logger.logInfo("Synchronizing blocks " + bif + " to " + bit + " from " + toBlock + "...") ;	
		var txs = [], many = this.pageCount, retry = this.retryCount + 1;			
		while(retry != 0){
			try{
				txs = [];
				txs = await this.api.account.txlist(this.address.toLowerCase(), bif, bit, 0, many, "asc");
				if(txs && txs.result.length == many){
					// We are already in trouble here. If number of transactions retrieved is same as how
					// many we wanted then it means there are more records in that block range. We therefore
					// reduce the block range until we get less records than how many we asked for.
					retry--;
					blockCount = Math.round(blockCount / 2);	
					this.logger.logInfo("Result window is too large. Reduced block range to " + blockCount + ". Retry (" + retry + "/" + this.retryCount + ").");
					bit -= blockCount;
					this.logger.logInfo("(Updated) Synchronizing blocks " + bif + " to " + bit + " from " + toBlock + "...");	
					continue;
				}
				emc = emc.concat(txs.result);
			}
			catch(err){
				//console.log(err);
				if(err && err == "Max rate limit reached, please use API Key for higher rate limit" && retry > 0){
					retry--;
					this.logger.logInfo("Max rate limit reached. Retry (" + retry + "/" + this.retryCount + "), Waiting " + this.retryDelay + "ms...");
					await delay(this.retryDelay);
					continue;
				}
				else if(err && err.startsWith("No transactions found")){
					this.logger.logInfo("No transactions found.");
				}
				else{
					this.logger.logError("Error: " + err);
					throw err;
				}
			}
			// Scale block range up if it has reduced from max block range.
			if(bit != toBlock && blockCount < maxBlockCount){
				blockCount = blockCount + Math.round(maxBlockCount / 10);
				if(blockCount > maxBlockCount){
					blockCount = maxBlockCount;
				}
				this.logger.logInfo("Increased block range to " + blockCount + ".");
			}
			// Exit re-try loop.
			break;
		}
		// If number of retries has reached zero then throw error.
		if(retry == 0){
			throw "Maximum allowed retries has been reached.";
		}		
	}
	return emc;
}

// ---------------------------------------------------------------------------------------

EtherscanFilter.prototype.synchronizeIMC = async function(fromBlock, toBlock){

	var imc = [];
	
	// Check that we do not try get more blocks than we require.
	var blockCount = this.blockCount;
	var range = toBlock - fromBlock;
	if(range < blockCount){ blockCount = range; }
	// Set the max block size.
	var maxBlockCount = blockCount;	
	
	for(	bif = fromBlock, 
			bit = bif + blockCount, 
			bit > toBlock ? bit = toBlock : bit = bit
												; 
			bif <= toBlock
												; 
			bif = bit + 1, bit = bit + blockCount
	){
		if(bit > toBlock) { bit = toBlock; }
		var left = toBlock - bif;
		if(left < blockCount){ 
			blockCount = left; 
			this.logger.logInfo("Block range larger than required. Reduced block range to " + blockCount + ".");
		}
		this.logger.logInfo("Synchronizing blocks " + bif + " to " + bit + " from " + toBlock + "...") ;	
		var txs = [], many = this.pageCount, retry = this.retryCount + 1;			
		while(retry != 0){
			try{
				txs = [];
				txs = await this.api.account.txlistinternal(null, this.address.toLowerCase(), bif, bit, 1, many, "asc");
				if(txs && txs.result.length == many){
					// We are already in trouble here. If number of transactions retrieved is same as how
					// many we wanted then it means there are more records in that block range. We therefore
					// reduce the block range until we get less records than how many we asked for.
					retry--;
					blockCount = Math.round(blockCount / 2);	
					this.logger.logInfo("Result window is too large. Reduced block range to " + blockCount + ". Retry (" + retry + "/" + this.retryCount + ").");
					bit -= blockCount;
					this.logger.logInfo("(Updated) Synchronizing blocks " + bif + " to " + bit + " from " + toBlock + "...");	
					continue;
				}
				imc = imc.concat(txs.result);
			}
			catch(err){
				if(err && err == "Max rate limit reached, please use API Key for higher rate limit" && retry > 0){
					retry--;
					this.logger.logInfo("Max rate limit reached. Retry (" + retry + "/" + this.retryCount + "), Waiting " + this.retryDelay + "ms...");
					await delay(this.retryDelay);
					continue;
				}
				else if(err && err.startsWith("No transactions found")){
					this.logger.logInfo("No transactions found.");
				}
				else{
					this.logger.logError("Error: " + err);
					throw err;
				}
			}
			// Scale block range up if it has reduced from max block range.
			if(bit != toBlock && blockCount < maxBlockCount){
				blockCount = blockCount + Math.round(maxBlockCount / 10);
				if(blockCount > maxBlockCount){
					blockCount = maxBlockCount;
				}
				this.logger.logInfo("Increased block range to " + blockCount + ".");
			}
			// Exit re-try loop.
			break;
		}
		// If number of retries has reached zero then throw error.
		if(retry == 0){
			throw "Maximum allowed retries has been reached.";
		}		
	}
	return imc;
}

// ---------------------------------------------------------------------------------------

/**
 * The same transaction can be linked to one or more internal transaction call. This 
 * function will go through the provided txlist and remove any duplicate transactions
 * keeping only the first tx reference encountered.
 *
 * @param emc TXs loaded as external message calls.
 * @param imc TXs loaded as internal message calls.
 * @return Array containing only unique transactions.
 */
EtherscanFilter.prototype.flattenTxList = async function(emcTxs, imcTxs){

	var _self = this;

	var txList = [];
	// All external message calls are TXs.
	if(emcTxs){
		emcTxs.forEach(function(emc){
			if(emc.blockNumber >= _self.from && emc.blockNumber <= _self.to){
				txList.push(
					{
						blockNumber : emc.blockNumber,
						hash : emc.hash,
					}
				);
			}
		});
	}
	// Internal message calls needs to be grouped.
	if(imcTxs){
		for(var i = 0; i < imcTxs.length; i++){
			var txInt = imcTxs[i];
			if(txInt.blockNumber >= _self.from && txInt.blockNumber <= _self.to){
				var found = false;
				txList.forEach(function (tx){
					if(tx.hash == txInt.hash){
						found = true;
						return;	// stop loop.
					}
				});
				if(!found){
					txList.push(
						{
							blockNumber : txInt.blockNumber,
							hash : txInt.hash,
						}
					);
				}
			}
		}
	}
	// Sort transactions within the block.
	txList.sort(function(a, b){
		if(parseInt(a.blockNumber) > parseInt(b.blockNumber)){ return 1; }
		else if(parseInt(a.blockNumber) < parseInt(b.blockNumber)){ return -1; }
		else{
			if(parseInt(a.transactionIndex) > parseInt(b.transactionIndex)){ return 1; }
			else{ return -1;}
		}
	});

	return txList;
}

// ---------------------------------------------------------------------------------------

/**
 * 
 * @param { } txs 
 */
 EtherscanFilter.prototype.applyFunctionSelect = async function(emc){

	var _self = this;

	// Get keccak256 representation for the selected functions.
	var fsString = this.fs.slice(1,this.fs.length-1);
	var fsFunctions = splitString(fsString, { separator: ',', brackets: true })
	var fsSignatures = [];
	fsFunctions.forEach(function(f){
		var functionKeccak256 = keccak256(f).toString("hex").slice(0,8);
		_self.logger.logInfo("(keccak256) " + f + " = " + functionKeccak256);
		fsSignatures.push(functionKeccak256);
	});

	var filter = [];
	this.logger.logInfo("Applying function select filter on external message calls...");

	// Loop through all loaded transactions and only add the
	// transactions which input match the function keccak 256 value.

	// Filter external message calls txs.
	emc.forEach(function(tx, index){
		var found = false;
		fsSignatures.forEach(function(fsSignature){
			if(fsSignature === tx.input.slice(2, 10)){
				filter.push(tx);
				found = true;
				return;
			}
		});
		if(found == true) { return; }
	});

	return filter;
}

// ---------------------------------------------------------------------------------------

module.exports = EtherscanFilter;

// ---------------------------------------------------------------------------------------
