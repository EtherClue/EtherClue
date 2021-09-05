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

const Web3 		= require('web3');
const {Debug} 	= require('web3-eth-debug');

// ---------------------------------------------------------------------------------------

const delay = ms => new Promise(res => setTimeout(res, ms));

// ---------------------------------------------------------------------------------------

/**
 * 
 */
class Web3Filter {
	constructor(options){
		this.logger = options.logger;
		this.address = options.address;
		this.from = parseInt(options.from);
		this.to = parseInt(options.to);
		this.provider = options.provider;
		this.web3 = new Web3(new Web3.providers.HttpProvider(options.provider));
		this.debug = new Debug(new Web3.providers.HttpProvider(options.provider));
		this.retryCount = parseInt(options.retryCount);
		this.retryDelay = parseInt(options.retryDelay);
		this.threadCount = 3;

		if(!this.retryCount){ this.retryCount = 15; }
		if(!this.retryDelay){ this.retryDelay = 500; }		
	}
}

// ---------------------------------------------------------------------------------------

/**
 * 
 */
Web3Filter.prototype.txList = async function(){

	var _self = this;

	var maxThreads = this.threadCount;
	var blocks = this.to - this.from;
	if(blocks < maxThreads) { maxThreads = blocks; }
	var threads = [];
	var threadSize = Math.ceil(blocks / maxThreads);
	
	for(var i = 0; i < maxThreads; i++){
		var threadFrom = this.from + (i * threadSize);
		var threadTo = threadFrom + (threadSize -1);
		if(threadTo > this.to){ threadTo = this.to; }
		this.logger.logInfo("Thread " + (i+1) + " started to retrieve TXs from block " + 
				threadFrom + " to block " + threadTo + ".");
		threads[i] = worker((i+1), threadFrom , threadTo);
		await delay(500);
	}
	
	var txs = [];
	
	this.logger.logInfo("Waiting...");
	await Promise.all(threads).then(result1 => {
			result1.forEach(function(result2){
				result2.forEach(function(tx){
					txs.push(tx);
				})
			})
		});
	this.logger.logInfo("All threads completed successfully!");
	return txs;

	/**
	 * Retrieves transactions from blockchain asynch.
	 */
	async function worker(id, from, to){
		var txs = [];
		for(var b = from; b <= to; b++){		
			var txCount;
			var retry = _self.retryCount;
			while(retry != 0){
				try{
					txCount = await _self.web3.eth.getBlockTransactionCount(b);
					break;
				}
				catch(err){
					_self.logger.logInfo("Retry (" + retry + "/" + _self.retryCount + 
							"), Waiting " + _self.retryDelay + "ms...");
					retry--;
					delay(_self.retryDelay);					
				}
			}
			if(retry == 0){
				throw "Maximum allowed retries has been reached.";
			}			
			if(b % 100 == 0) { 
				_self.logger.logInfo("Thread " + id + " reached block " + b + 
						" with " + (to - b) + " blocks left to process. " + 
						(b - from) + " blocks and " + txs.length + " TXs seen.");
			}
			for(var t = 0; t < txCount; t++){
				var retry = _self.retryCount;
				while(retry != 0){
					try{
						var tx = await _self.web3.eth.getTransactionFromBlock(b, t);
						txs.push(
							{
								blockNumber: b,
								hash: tx.hash
							}
						);
						break;
					}
					catch(err){
						_self.logger.logInfo("Retry (" + retry + "/" + _self.retryCount + 
								"), Waiting " + _self.retryDelay + "ms...");
						retry--;
						delay(_self.retryDelay);
					}
				}		// If number of retries has reached zero then throw error.
				if(retry == 0){
					throw "Maximum allowed retries has been reached.";
				}
			}
		}
		return txs;
	}
}

// ---------------------------------------------------------------------------------------

Web3Filter.prototype.toString = async function(){
	return "Web3Filter";
}

// ---------------------------------------------------------------------------------------

module.exports = Web3Filter;

// ---------------------------------------------------------------------------------------
