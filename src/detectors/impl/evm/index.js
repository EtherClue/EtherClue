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

/**
 * Stops further processing until the set delay has expired.
 * 
 * @param ms Milliseconds to wait.
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

// ---------------------------------------------------------------------------------------

/**
 * EVM level IoC detector implementation.
 */
class EvmLevelIoCDetector{
	constructor(options){
		
		this.explorer = options.explorer;
		this.logger = options.logger;
		this.address = options.address;
		this.pattern = options.pattern;

		var DetectorType = require("./ioc-detectors/" + options.pattern);
		this.detector = new DetectorType();

		this.cacheDB = options.cacheDB;

		this.retryCount = options.retryCount;
		this.retryDelay = options.retryDelay;

		// Default options.
		if(!this.retryCount){ this.retryCount = 15; }
		if(!this.retryDelay){ this.retryDelay = 500; }
	}
}

// ---------------------------------------------------------------------------------------

/**
 * Will process all transactions in the given list. Transactions are expected to have the
 * following basic information:
 * 
 * 	blockNum	-	The block in which the transaction has been processed.
 * 	hash		- 	The unique id of the transaction.
 * 	from		- 	The account address representing the transaction sender.
 * 	to			- 	The account address representing the transaction recipient.
 * 
 * @param txList	The transactions to be processed. 
 */
EvmLevelIoCDetector.prototype.processTXs = async function(txList){

	var _self = this;

	var txCount = 0; var blockCount = 0; var lastBlock = -1;
	var malTxCount = 0; var malBlockCount = 0; var lastMalBlock = -1;
	var lastMalTx = -1;
	var malTxs = [];

	// Process each transaction hash one by one.
	for(var i = 0; i < txList.length; i++) { 
		await processTx(txList[i]);
		if(txList[i].blockNumber != lastBlock){
			lastBlock = txList[i].blockNumber;
			blockCount++;
		}
		txCount++;
	}

	// Log the number of malicious transactions found.
	_self.logger.logInfo("Found " + malTxCount + " malicious txs in " + 
			malBlockCount + " blocks from " + txCount + " txs in " +
			blockCount + " blocks.");
	_self.logger.logInfo("Details ( - <index> - <txhash> (<blocknumber>):");
	malTxs.forEach(function(tx, index){
		_self.logger.logInfo(" - " + (index + 1) + " - " + tx.hash + " (" + tx.blockNumber + ")");
	});

	// Log the number of non-malicious transactions found.
	_self.logger.logInfo("The following TXs where not detected as malicious.");
	_self.logger.logInfo("Details ( - <index> - <txhash> (<blocknumber>):");
	txList.forEach(function(tx, index){
		if(!malTxs.includes(tx)){
			_self.logger.logInfo(" - " + (index + 1) + " - " + tx.hash + " (" + tx.blockNumber + ")");
		}
	});

	return malTxs.length;

	// -----------------------------------------------------------------------------------

	/**
	 * Process a single transaction.
	 * 
	 * @param tx The transaction to be processed. 
	 */
	async function processTx(tx){

		_self.logger.logInfo("Processing transaction " + truncate(tx.hash, 16));
		_self.logger.logInfo("block=" + tx.blockNumber + "");

		// Retrieving transaction trace from database.
		var trace;
		if(_self.cacheDB){
			_self.logger.logInfo("Attempt to load transaction trace from cache.");
			try{ 
				trace = await _self.cacheDB.get(txTraceFor(tx.hash)); 
			} 
			catch(err){}
		}
		// If this fails retrieve transaction trace using linker.
		if(!trace){
			if(_self.cacheDB){
				_self.logger.logInfo("Could not load transaction trace from cache.");
			}
			_self.logger.logInfo("Building transaction trace. This may take some time.");
			var retry = _self.retryCount;
			while(true){
				try{
					var extraconfig = {timeout: "120s"};
					if(_self.detector.tracerconfig){
						extraconfig = _self.detector.tracerconfig(_self.address);
						//console.log("Applying tracer config: " + JSON.stringify(extraconfig));
					}
					trace = await _self.explorer.txTrace(tx.hash, extraconfig);
					//trace = await _self.linker.txTrace(tx.hash, {});
				}
				catch(err){
					_self.logger.logError(err);
					if(retry > 0){
						retry--;
						console.log("Retry (" + retry + "/" + _self.retryCount + "), Waiting " + _self.retryDelay + "ms...");
						await delay(_self.retryDelay);
						continue;
					}
					else{
						// If this fails log error and stop.
						_self.logger.logError("Building tx trace failed.");
						//_self.logger.logError(err);
						return;
					}
				}
				break;
			}
			// Put trace in database for future reference.
			if(_self.cacheDB){
				await _self.cacheDB.put(txTraceFor(tx.hash), trace);
			}
		}
		else{ _self.logger.logInfo("Loaded transaction trace from cache."); }

		// Processing transactions trace through evm level ioc detectors.
		_self.logger.logInfo("Applying EVM level IOC detector to transaction trace.");
		_self.logger.logInfo("steps=" + trace.structLogs.length);
		var steps = trace.structLogs.length, detectionText;
		await _self.detector.consider(_self.address, tx, trace, 
			function(address, _tx, step, index, ext){
				detectionText = _self.detector.getIoCName() + " detected " + 
						"(s=" + index + ", d=" + step.depth + 
						", pc=" + step.pc + ", op=" + step.op + 
						", " + ext + ")";
				_self.logger.logInfo(detectionText);
			
				if(lastMalTx != tx.hash){
					lastMalTx = tx.hash;
					malTxCount++;
					malTxs.push(tx);
				}
				if(tx.blockNumber != lastMalBlock){
					lastMalBlock = tx.blockNumber;
					malBlockCount++;
				}
			});
		_self.logger.logInfo("Ready!");
	}

	// -----------------------------------------------------------------------------------

	/**
	 * Helper function to truncate the size of text to a given number of characters.
	 * @param text 	The text to be truncated.
	 * @param size 	The size to which the text is to be truncated.
	 */
	function truncate(text, size){
		if(!text){return "";}
		if(text.length <= size) return text;
		else{
			return text.slice(0, size) + "..[truncated]";
		}
	}

	// -----------------------------------------------------------------------------------

	/**
	 * Return unique database identifier for the transaction hash and IoC pattern.
	 * @param txhash	The transaction hash.
	 */
	function txTraceFor(txhash){
		return "?ioc=" + _self.pattern + "&" + "tx.hash=" + txhash;
	}

	// -----------------------------------------------------------------------------------

}

// ---------------------------------------------------------------------------------------

/**
 * Experimental. 
 * 
 * Rather than process a sequence of transactions this would process the transaction trace
 * for a whole block. 
 * 
 * @param fromBlock	The block number from which to process.
 * @param toBlock 	The block number to which to process.
 */
EvmLevelIoCDetector.prototype.processBlocks = async function(fromBlock, toBlock){
	return null;
}

// ---------------------------------------------------------------------------------------

module.exports = EvmLevelIoCDetector;

// ---------------------------------------------------------------------------------------
