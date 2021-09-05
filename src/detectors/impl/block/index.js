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
 * @version     2.0
 * @since		1.0
 */

// ---------------------------------------------------------------------------------------

const delay = ms => new Promise(res => setTimeout(res, ms));

// ---------------------------------------------------------------------------------------

/**
 * Block level IoC detector implementation.
 */
class BlockLevelIoCDetector{
	constructor(options){
		this.explorer = options.explorer;
		this.logger = options.logger;
		this.address = options.address;
		this.pattern = options.pattern;
		var DetectorType = require("./ioc-detectors/" + options.pattern);
		this.cacheDB = options.cacheDB;
		this.detector = new DetectorType(this.address);
		this.retryCount = options.retryCount;
		this.retryDelay = options.retryDelay;
		if(!this.retryCount){ this.retryCount = 15; }
		if(!this.retryDelay){ this.retryDelay = 500; }
	}
}

// ---------------------------------------------------------------------------------------

/**
 * Process a list of transactions.
 * 
 * @param txList	The transactions to be processed. 
 */
 BlockLevelIoCDetector.prototype.processTXs = async function(txList){

	var _self = this;

	var blocks = new Map();
	blocks = await selectBlocks(txList, blocks);
	return await this.processBlocks(blocks);

	// -----------------------------------------------------------------------------------

	/**
	 * Loops through the provided list of transactions and groups these by block number.
	 * 
	 * @param txList	The list of transactions to be processed. 
	 * @param blocks 	Map where block definitions will be stored.
	 */
	async function selectBlocks(txList, blocks){
		for(var i = 0; i < txList.length; i++){
			var tx = txList[i];
			//var key = "0x" + parseInt(tx.blockNumber).toString(16);
			
			try{var key = tx.blockNumber.toString();}
			catch(err){ console.log(tx); return null; }
			var block = blocks.get(key);
			if(!block){
				block = [];
				blocks.set(key, block);
			}
			block.push(tx);
			// Sort transactions within the block.
			block.sort(function(a, b){
				if(a.transactionIndex > b.transactionIndex){ return 1; }
				else if(a.transactionIndex < b.transactionIndex){ return -1; }
				return 0;
			});
		}
		blocks = new Map([...blocks.entries()].sort(function(a,b){
			if(a[0] > b[0]){ return 1; }
			if(a[0] < b[0]){ return -1; }
			return 0;
		}));
		return blocks;
	}

}

// ---------------------------------------------------------------------------------------

/**
 * Will process all blocks in the given range.
 * 
 * @param fromBlock	The block number from which to process.
 * @param toBlock 	The block number to which to process.
 */
 BlockLevelIoCDetector.prototype.processBlocks = async function(fromBlock, toBlock){

	var _self = this;

	return null;
}

// ---------------------------------------------------------------------------------------

/**
 * Process the given blocks. See selectBlocks function for format of object.
 * 
 * @param blocks	The blocks to be processed.
 */
BlockLevelIoCDetector.prototype.processBlocks = async function(blocks){

	var _self = this;

	var malBlocks = [];

	// Print how many blocks will be processed.
	_self.logger.logInfo("Processing " + blocks.size + " blocks.");
	
	// Loop through each of the blocks and process accordingly.
	var blockNumbers = Array.from(blocks.keys());

	//for(var b = blocks.size - 1; b >= 0; b--){
	for(var b = 0; b < blocks.size; b++){
	
		var iocName = _self.detector.getIoCName();
		
		var blockNumber = blockNumbers[b];
	
		// Log / print transaction to be processed. 	
		_self.logger.logInfo("Processing block " + blockNumber + 
			" (" + (b+1) + "/" + blocks.size + ")");
			
		var txs = blocks.get(blockNumber);
		for(const tx of txs){

			// Note: at the moment we always enhance transactions with their 
			// receipts. This could change by making the step optional.
			txReceipt = await _self.explorer.txReceipt(tx.hash);
			tx.receipt = txReceipt;

			// Log transactions part of the block.
			_self.logger.logInfo(truncate(tx.hash, 16) + 
				(tx.listinternal 
					? " (" + tx.listinternal.length + ")" 
					: ""));
		}
				
		// Build accounts (required when building genesis block).
		var accounts = [
			{
				address: _self.address, 
				storage: _self.detector.storage(txs),
			}
		];
		//_self.logger.logInfo(accounts);

		// Retrieve wanted information for previous block.
		var blockBefore = null;
		try{
			if(_self.cacheDB){
				blockBefore = await _self.cacheDB.get(blockNumberEq(
					iocName + "_" + blockNumber + "_" + (blockNumber -1)));
			}
		}
		catch(err){}
		if(!blockBefore){
			if(_self.cacheDB){
				_self.logger.logInfo("Could not load previous block " 
					+ (blockNumber-1) + " from cache.");
			}
			_self.logger.logInfo("Building previous block " 
				+ (blockNumber-1) + ".");
			var blockBefore = await _self.explorer.buildGenesisBlock(
				blockNumber-1, accounts);
			if(_self.cacheDB){	
				await _self.cacheDB.put(blockNumberEq(
					iocName + "_" + blockNumber + "_" + (blockNumber -1)), 
					blockBefore);
			}
		}
		else{
			_self.logger.logInfo("Loaded previous block " 
				+ (blockNumber-1) + " from cache.");
		}
					
		// Retrieve wanted information for this block.
		var blockAfter = null;
		try{
			if(_self.cacheDB){
				blockAfter = await _self.cacheDB.get(blockNumberEq(
					iocName + "_" + blockNumber + "_" + (blockNumber)));
			}
		} 
		catch(err){}
		if(!blockAfter){
			if(_self.cacheDB){
				_self.logger.logInfo("Could not load target block " 
					+ blockNumber + " from cache.");
			}
			_self.logger.logInfo("Building target block " 
				+ (blockNumber) + ".");			
			var blockAfter = await _self.explorer.buildGenesisBlock(
				blockNumber, accounts);
			if(_self.cacheDB){
				await _self.cacheDB.put(blockNumberEq(
					iocName + "_" + blockNumber + "_" + (blockNumber)), 
					blockAfter);
			}
		}
		else{
			_self.logger.logInfo("Loaded target block " 
				+ blockNumber + " from cache.");
		}

		// Check if detector detects vulnerability.		
		if(_self.detector.consider(blockNumber, txs, accounts, blockBefore, blockAfter)){
			_self.logger.logInfo("" 
				+ iocName
				+ " IoC detected " 
				+ "(" + _self.detector.getExtInfo(blockNumber) + ").");
			malBlocks.push(blockNumber);
		}
		_self.logger.logInfo("Ready!");
	}

	// Print blocks where malicious blocks have been found.
	_self.logger.logInfo("Details ( - <index> - <blocknumber>):");
	malBlocks.forEach(function(entry, index){
		_self.logger.logInfo(" - " + (index + 1) + " - " + entry);
	});

	return malBlocks.length;

	// -----------------------------------------------------------------------------------

	/**
	 * Truncate given text to wanted size.
	 * 
	 * @param text	The text to be truncated.
	 * @param size 	The size to which the text is to be truncated.
	 */
	function truncate(text, size){
		if(text.length <= size) return text;
		else{
			return text.slice(0, size) + "..[truncated]";
		}
	}

	// -----------------------------------------------------------------------------------

	/**
	 * Returns a unique identifier for the block to store in database.
	 * 
	 * @param number	blocknumber.
	 */
	function blockNumberEq(number){
		return "block.number=" + number;
	}

	// -----------------------------------------------------------------------------------

}

// ---------------------------------------------------------------------------------------

module.exports = BlockLevelIoCDetector;

// ---------------------------------------------------------------------------------------
