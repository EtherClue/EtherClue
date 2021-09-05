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

const Web3 			= require('web3');
const {Debug} 		= require('web3-eth-debug');
const BigInt		= require("big-integer");

// ---------------------------------------------------------------------------------------

/**
 * Web3 blockchain explorer interface.
 */
class Web3Explorer {
	constructor(options){
		this.logger = options.logger;
		this.provider = options.provider;
		this.web3 = new Web3(new Web3.providers.HttpProvider(options.provider));
		this.debug = new Debug(new Web3.providers.HttpProvider(options.provider));	
	}
}

// ---------------------------------------------------------------------------------------

/**
 * Returns the block number that the blockchain has reached.
 * 
 * @returns The block number the blockchain has reached.
 */
Web3Explorer.prototype.getBlockNumber = async function(){
	return await this.web3.eth.getBlockNumber();
}

// ---------------------------------------------------------------------------------------

/**
 * Return transaction details for the given transaction hash.
 * 
 * @param txHash	Transaction hash.
 * @returns Transaction details.
 */
Web3Explorer.prototype.txDetails = async function(txHash){
	var tx = await this.web3.eth.getTransaction(txHash);
	return tx;
}

// ---------------------------------------------------------------------------------------

/**
 * Return transaction receipt for the given transaction hash.
 * 
 * @param txHash	Transaction hash.
 * @returns Transaction receipt.
 */
Web3Explorer.prototype.txReceipt = async function(txHash){
	var receipt = await this.web3.eth.getTransactionReceipt(txHash);
	return receipt;
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
Web3Explorer.prototype.txTrace = async function(txhash, config){
	var _self = this;
	//console.log(config);
	var txtrace = await this.debug.getTransactionTrace(txhash, config);
	//console.log(txtrace);
	return txtrace;
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
Web3Explorer.prototype.blockTrace = async function(blockNumber, config){
	var _self = this;
	//console.log(config);
	var trace = await this.debug.getBlockTraceByNumber(blockNumber, config);
	//console.log(txtrace);
	return trace;
}

// ---------------------------------------------------------------------------------------

/**
 * Return balance of an account at the given address at the given block number.
 * 
 * @param address 		Account address.
 * @param blockNumber 	Block number.
 * @returns The balance of the given account address at the given block number.
 */
Web3Explorer.prototype.getBalanceAt = async function(address, blockNumber){
	var balance = BigInt(0);
	try{ 
		balance = BigInt(await this.web3.eth.getBalance(address, blockNumber)); 
	}
	catch(err){ console.log(err); }
	return balance;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns the storage value of an account at the given block number.
 * @param address 		Account address.
 * @param storageId 	Storage Id.
 * @param blockNumber 	Block number.
 * @returns The storage value of an account at the given block number.
 */
Web3Explorer.prototype.getStorageAt = async function(address, storageId, blockNumber){
	var value = await this.web3.eth.getStorageAt(
		address,
		storageId,
		blockNumber);
//console.log("address=" + address + ", storageId=" + storageId + ", blockNumber=" + blockNumber + ", value=" + value);
return value;
}

// ---------------------------------------------------------------------------------------

/**
 * Builds a genesis block based on the block number and account information. 
 *
 * @param blockNumber The block number representing the ethereum block from which the 
 *		information will be loaded.
 * @param accounts An object in the format [{address:<address>, storage:[<position>,]}]
 *		representing the addresses and storage positions to be included in 
 *		genesis block.
 *
 * @return Genesis block.
 */
 Web3Explorer.prototype.buildGenesisBlock = async function(blockNumber, accounts){

	// what-does-each-genesis-json-parameter-mean:
	// https://ethereum.stackexchange.com/questions/2376/
	// https://arvanaghi.com/blog/explaining-the-genesis-block-in-ethereum/
	// https://www.skcript.com/svr/genesis-block-ethereum/
	
	// Build genesis block (defaults supported). 
	var genesis = {};
	var block = {};
	
	// Store information about accounts.
	block["alloc"] = {};
	
	// Default configurations.
	/*block["mixhash"] = genesis.mixhash ? genesis.mixhash : 		"0x0";
	block["nonce"] = genesis.nonce ? genesis.nonce : 		"0x0";
	block["difficulty"] = genesis.difficulty ? genesis.difficulty : "0x1";
	block["coinbase"] = genesis.coinbase ? genesis.coinbase : 	"0x0";
	block["timestamp"] = genesis.timestamp ? genesis.timestamp : 	"0x0";
	block["parentHash"] = genesis.nonce ? genesis.nonce : 		"0x0";
	block["extraData"] = genesis.extraData ? genesis.extraData : 	"0x0";
	block["number"] = genesis.number ? genesis.number : 		"0x0";
	block["gasLimit"] = genesis.gasLimit ? genesis.gasLimit : 	"0x99999";*/
	
	// Additional configuration details.
	block["config"] = {};
	var config = block["config"];
	if(genesis.config){
		genesis.config.forEach(function(entry){
			config[entry.key] = config[entry.value];
		});
	}
	
	// Retrieve account information.
	for(var i = 0; accounts && i < accounts.length; i++){
			
		var address = accounts[i].address;
		var storage = accounts[i].storage;
			
		// Build account structure.
		var account = {};
		block["alloc"][address] = account;
			
		// Get account balance. All accounts must have balance value.
		var balance = null;
		try{ 
			//console.log("ADDRESS: " + address);
			balance = await this.web3.eth.getBalance(address, blockNumber); 
		}
		catch(err){ console.log(err); }
		//console.log("LOADED BALANCE: " + balance);
		account["balance"] = "0x" + BigInt(balance).toString(16);
		
		// Get account code. If result is returned then this is a 
		// smart contract and therefore we also load storage details.
		/*
		var code = null;
		try{ 
			code = await this.web3.eth.getCode(address); }
		catch(err){ console.log(err); }
		account["code"] = code;
		*/
		
		// Get account storage (if smart contract).
		var structure = {};
		for(var s = 0; storage && s < storage.length; s++){
			var value = await this.web3.eth.getStorageAt(
				address,
				storage[s],
				blockNumber);
			structure[storage[s]] = value;
		}
		account["storage"] = structure;
		
		// Set default nonce;
		account["nonce"] = "0x1";
	}
	
	// Return constructed genesis block.
	return block;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns the name of this blockchain explorer interface.
 * 
 * @returns The name of this blockchain explorer interface.
 */
Web3Explorer.prototype.toString = async function(){
	return "Web3Explorer";
}

// ---------------------------------------------------------------------------------------

module.exports = Web3Explorer;

// ---------------------------------------------------------------------------------------
