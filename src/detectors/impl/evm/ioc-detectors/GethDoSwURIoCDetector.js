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
 * @version     1.0
 * @since		1.0
 */

// --------------------------------------------------------------------------------------

// Denial of Service (DoS) with (Unexpected) Revert.

// --------------------------------------------------------------------------------------

const Op 			= require("etherclue-helpers").create("Op");
const ExprType 		= require("etherclue-helpers").create("ExprType");
const CAInfo		= require("etherclue-helpers/CAInfo");
const BigInt 		= require("big-integer");

// --------------------------------------------------------------------------------------

class GethDoSwURIoCDetector {}

// --------------------------------------------------------------------------------------

GethDoSwURIoCDetector.prototype.tracerconfig = function(caAddress){

	var tracerObject = this.tracer();
	var tracerJson = JSON.stringify(tracerObject, function(key, val) {
		return (typeof val === 'function') ? '' + val : val;
	});
	var tracerString = tracerJson.replace(/"/g,"");
	tracerString = tracerString.replace(/(\\r\\n|\\n|\\r|\\t)/gm,"");
	tracerString = tracerString.replace(new RegExp("{address}", 'g'), ""+ caAddress + "");
	//tracerString = tracerString.replace(new RegExp("{random}", 'g'), ""+ Math.floor(Math.random() * Math.floor(1000000)) + "");
	extraconfig = {timeout: "120s", tracer : tracerString };
	//console.log(extraconfig);
	return extraconfig;	
}

// --------------------------------------------------------------------------------------

/**
 * Returns all return events identified in the trace.
 */
 GethDoSwURIoCDetector.prototype.tracer = function(){

	var tracer = { 
		structLogs:[],
		callstack:[],
		vmstep: 0,
		address: '0x0',
		depth: 0,
		step: function(log,db){
			if(log.getDepth() < this.depth){
				var entry = {};
				entry['returnFrom'] = this.address;
				entry['returnTo'] = toHex(log.contract.getAddress());
				entry['returnValue'] = log.stack.peek(0).toString(16);
				entry['pc'] = log.getPC();
				entry['op'] = log.op.toString();
				entry['step'] = this.vmstep;
				entry['depth'] = this.depth;
				this.structLogs.push(entry);
			}
			this.depth = log.getDepth();
			this.address = toHex(log.contract.getAddress());
			this.vmstep = this.vmstep + 1;
		}, 
		fault: function(log,db){}, 
		result: function(ctx,db) {
			return {'structLogs':this.structLogs};
		}
	};
	return tracer;
}

// --------------------------------------------------------------------------------------

GethDoSwURIoCDetector.prototype.consider = function(address, tx, trace, callback){

	var caInfo = new CAInfo();
	caInfo.resetTo(address, true);

	trace.structLogs.forEach(function(entry, index){
		
		//console.log(entry);
		//return;

		// Check if step is to be considered.
		if(!caInfo.consider(entry.pc)){ return; }

		// If return to is of contract and return value is zero then we know the
		// call made from this contract failed.
		if(entry.returnTo == address){
			if(entry.returnValue == 0){
				
				// Raise callback.
				callback(
					entry.address,
					tx,
					entry,
					entry.step,
					"");
			}
		}

	});

}

// --------------------------------------------------------------------------------------

GethDoSwURIoCDetector.prototype.getIoCName = function(){ return "DoS"; }

// --------------------------------------------------------------------------------------

module.exports = GethDoSwURIoCDetector;

// --------------------------------------------------------------------------------------
