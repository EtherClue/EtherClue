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
 * @version     2.1
 * @since		1.0
 */

// --------------------------------------------------------------------------------------

const CAInfo		= require("etherclue-helpers/CAInfo");

// --------------------------------------------------------------------------------------

/**
 * Custom Reentracy IoC detection pattern.
 * 
 * Using a custom tracer over a standard tracer reduces the payload that needs to be 
 * transmitted from the ethereum node to EtherClue. Further more the custom tracer can
 * be set up to stop any further processing as soon as an instance of reentrancy is
 * detected. 
 */
class GethReentrancyIoCDetector {}

// --------------------------------------------------------------------------------------

/**
 * Builds a custom tracer sent as part of the debug_traceTransact call.
 * 
 * The custom tracer will search for IoCs as a result of reentrancy at the same time as 
 * the transaction is replayed reducing the payload size sent from the remote node, i.e.  
 * - the trace processed by the {@link #consider(address,tx,trace,callback)} function.
 * 
 * @param address	The address of the vulnerable contract account. 
 * @returns	The custom tracer sent as part of the debug_traceTransact call. 
 */
GethReentrancyIoCDetector.prototype.tracerconfig = function(address){

	var tracerObject = this.tracer();
	var tracerJson = JSON.stringify(tracerObject, function(key, val) {
		return (typeof val === 'function') ? '' + val : val;
	});
	var tracerString = tracerJson.replace(/"/g,"");
	tracerString = tracerString.replace(/(\\r\\n|\\n|\\r|\\t)/gm,"");
	tracerString = tracerString.replace(new RegExp("{address}", 'g'), ""+ address + "");
	//tracerString = tracerString.replace(new RegExp("{random}", 'g'), ""+ Math.floor(Math.random() * Math.floor(1000000)) + "");
	extraconfig = {timeout: "120s", tracer : tracerString };
	//console.log(extraconfig);
	return extraconfig;	
}

// --------------------------------------------------------------------------------------

/**
 * Builds a custom tracer that implements the Reentrancy IoC detection pattern. 
 * 
 * This has been updated to also handle DELEGATECALL and CODECALL by keeping a reference
 * of the contract account in execution seperate from the one in context.
 * 
 * @returns	A custom tracer implementing the Reentrancy IoC detection pattern.
 */
GethReentrancyIoCDetector.prototype.tracer = function(){

	var tracer = { 

		structLogs:[],
		tracerLogs:[],
		callstack:[],
		vmstep: 0,
		prevDepth: 0,
		prevOp: null,
		prevLoadedAddress: null,
		loadedAddress: null,
		contextAddress: null,
		stop: false,
		step: function(log,db){
			if(this.prevDepth == 0){
				var ar = {};
				ar['contextAddress'] = log.contract.getCaller();
				ar['loadedAddress'] = log.contract.getCaller();
				ar['depth'] = 0;
				this.callstack.push(ar);
				this.prevLoadedAddress = toHex(log.contract.getCaller());
				this.prevOp = 'CALL';
			}
			this.contextAddress = toHex(log.contract.getAddress());
			var op = log.op.toString();
			var depth = log.getDepth();
			if(!this.loadedAddress){
				this.loadedAddress = this.contextAddress;
			}
			if(depth > this.prevDepth){
				var ar = {};
				ar['contextAddress'] = this.contextAddress;
				ar['loadedAddress'] = this.loadedAddress;
				ar['depth'] = depth;
				this.callstack.push(ar);
				this.tracerLogs.push(' > ' + this.prevOp + ' from [' + this.prevDepth + '] ' + this.prevLoadedAddress + ' to [' + depth + '] ' + this.loadedAddress + ' (context: ' + this.contextAddress + ')');
			}
			if(depth < this.prevDepth ){
				var ar1 = this.callstack.pop();
				var ar2 = this.callstack[this.callstack.length - 1];
				this.tracerLogs.push(' < ' + this.prevOp + ' from [' + ar1['depth'] + '] ' + ar1['loadedAddress'] + ' to [' + depth + '] ' + ar2['loadedAddress'] + ' (context: ' + this.contextAddress + ')');
				this.loadedAddress = ar2['loadedAddress'];
			}		
			if(this.loadedAddress == '{address}'){
				if(op == 'SSTORE'){
					var i = this.callstack.length - 1;
					if(i > 0){
						var many = 0;
						for(; i > 0; i--){
							var ar = this.callstack[i];
							if(ar.contextAddress == this.contextAddress){
								many = many + 1;
							}
						}
						if(
							((this.loadedAddress == this.contextAddress) && many > 1)	||
							((this.loadedAddress != this.contextAddress) && many > 2)
						){
							var entry = {};
							entry['loadedAddress'] = this.loadedAddress;
							entry['contextAddress'] = this.contextAddress;
							entry['op'] = op;
							entry['pc'] = log.getPC();
							entry['step'] = this.vmstep;
							entry['depth'] = this.prevDepth;
							this.structLogs.push(entry);
							this.tracerLogs.push('Reentrancy detected (s=' + entry['step'] + ', d=' + entry['depth'] + ', pc=' + entry['pc'] + ', op=' + entry['op'] + ', )');
						}
					}
				}
			}
			if(op == 'DELEGATECALL' || op == 'CALLCODE' || op == 'CALL' || op == 'STATICCALL'){
				this.prevLoadedAddress = this.loadedAddress;
				this.loadedAddress = '0x' + log.stack.peek(1).toString(16);
			}
			if(op == 'CREATE' || op == 'CREATE2'){
				this.prevLoadedAddress = this.loadedAddress;
				this.loadedAddress = null;
			}
			this.prevDepth = depth;
			this.prevOp = op;
			this.vmstep = this.vmstep + 1;
		}, 
		fault: function(log,db){}, 
		result: function(ctx,db) {
			return {'structLogs': this.structLogs };
		}
	};
	return tracer;
}

// --------------------------------------------------------------------------------------

/**
 * Looks for IoCs in the given transaction trace.
 * 
 * @param address	The address of the vulnerable contract account.
 * @param tx 		The transaction details.
 * @param trace 	The transaction trace result.
 * @param callback 	Function to be called in an IoC is detected.
 */
GethReentrancyIoCDetector.prototype.consider = function(address, tx, trace, callback){

	// Load contract account meta-information.
	var caInfo = new CAInfo();
	caInfo.resetTo(address, true);

	// Loop through each result returned by the remote node.
	trace.structLogs.forEach(function(entry, index){
		
		//console.log(entry);
		//return;
		
		// Check if step is to be considered.
		if(!caInfo.consider(entry.pc)){ return; }

		// Raise callback.
		callback(
			entry.address,
			tx,
			entry,
			entry.step,
			"");
	});

}

// --------------------------------------------------------------------------------------

/**
 * Returns the name of the IoC detector.
 * 
 * @returns Name of this IoC detector.
 */
GethReentrancyIoCDetector.prototype.getIoCName = function(){ return "Reentrancy"; }

// --------------------------------------------------------------------------------------

module.exports = GethReentrancyIoCDetector;

// --------------------------------------------------------------------------------------
