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
 * @since		2.0
 */

// --------------------------------------------------------------------------------------

// Compact Reentrancy IoC Detector.

// --------------------------------------------------------------------------------------

const Op 		= require("etherclue-helpers").create("Op");
const ARStack 	= require("etherclue-helpers/ARStack");
const CAInfo	= require("etherclue-helpers/CAInfo");
const BigInt 	= require("big-integer");

// --------------------------------------------------------------------------------------

class CompactReentrancyIoCDetector {}

// --------------------------------------------------------------------------------------

CompactReentrancyIoCDetector.prototype.tracerconfig = function(caAddress){

	var tracerObject = this.tracer();
	var tracerJson = JSON.stringify(tracerObject, function(key, val) {
		return (typeof val === 'function') ? '' + val : val;
	});
	var tracerString = tracerJson.replace(/"/g,"");
	tracerString = tracerString.replace(/(\\r\\n|\\n|\\r|\\t)/gm,"");
	tracerString = tracerString.replace(new RegExp("{address}", 'g'), ""+ caAddress + "");
	extraconfig = {timeout: "120s", tracer : tracerString };
	return extraconfig;	
}

// --------------------------------------------------------------------------------------

CompactReentrancyIoCDetector.prototype.tracer = function(){

	var tracer = { 

		structLogs: [],

		caddr: '0x0',

		pdepth: 1,

		pstack: 1,

		ppc: 1,

		s: 0,

		step: function(log, db) {

			this.caddr = toHex(log.contract.getAddress());

			if(this.pdepth < log.getDepth()){
				entry = {};
				entry['o'] = 'C';
				entry['d'] = this.pdepth;
				entry['p'] = this.ppc;
				entry['t'] = this.s - 1;
				entry['s'] = this.pstack;
				this.structLogs.push(entry);			
			}	

			else if(this.pdepth > log.getDepth()){
				entry = {};
				entry['o'] = 'R';
				entry['d'] = this.pdepth;
				entry['p'] = this.ppc;
				entry['t'] = this.s - 1;
				this.structLogs.push(entry);			
			}		

			if(log.op.toString() == 'SSTORE'){
				if(this.caddr == '{address}'){
					entry = {};
					entry['o'] = 'S';
					entry['d'] = log.getDepth();
					entry['p'] = log.getPC();
					entry['t'] = this.s;
					this.structLogs.push(entry);
				}
			}

			this.pdepth = log.getDepth();
			this.ppc = log.getPC();
			this.pstack = log.stack.peek(1);
			this.s = this.s + 1;
		}, 

		fault: function(log, db) {}, 

		result: function(ctx, db) { 
			return { structLogs : this.structLogs };
		}, 
	};

	return tracer;
}

// --------------------------------------------------------------------------------------

CompactReentrancyIoCDetector.prototype.explodeTrace = function(compactTrace){ 

	var rebuiltTrace = [];
	
	compactTrace.forEach(function(compactStep, index){
		//console.log(compactStep);

		var entry = {};
		if(compactStep['o'] == 'C'){		entry['op'] = "CALL";}
		else if (compactStep['o'] == 'R'){ 	entry['op'] = "RETURN"; }
		else if (compactStep['o'] == 'S'){ 	entry['op'] = "SSTORE"; }
		entry['depth'] 	= compactStep['d'];
		entry['pc'] 	= compactStep['p'];
		entry['step'] 	= compactStep['t'];
		if(compactStep['o'] == 'C'){
			entry['stack'] = ['000000000000000000000000' + BigInt(compactStep['s'], 10).toString(16), 'NOTIMP'];
			// Add an extra step.
			extra = {}; extra['op'] = "NOTIMP"; extra['pc'] = entry['pc'] - 1;
				extra['step'] = entry['step'] - 1; extra['depth'] = entry['depth'];
			rebuiltTrace.push(extra);
		 }
		 rebuiltTrace.push(entry);
		 //console.log(entry);
	});

	return rebuiltTrace;
}

// --------------------------------------------------------------------------------------

CompactReentrancyIoCDetector.prototype.consider = function(address, tx, trace, callback){
	
	// Set debug true to get extra info printed on screen.
	var debug = false, ioc = false;
	
	var caInfo = new CAInfo();
	caInfo.resetTo(address, true);

	if(!callback) return;
	var arStack = new ARStack(tx);

	// Explode the retrieved trace in something that the IoC can process.
	trace.structLogs = this.explodeTrace(trace.structLogs, address);

	//console.log(trace.structLogs);
	//return;

	trace.structLogs.forEach(function(step,index){
		
		// Update activation record stack.
		arStack.consider(step);

		// Exit current iteration if not in target contract account.
		if(address && !arStack.isActive(address)) { return; }

		// Check if step is to be considered.
		if(!caInfo.consider(step.pc)){ return; }

		// Check if a reentrancy has occurd.
		if(step.op === Op.SSTORE){

			// If there exists an other activation record with the same id as
			// the current activation record then reentrancy has occured.
			if(arStack.count(arStack.active().id) > 1){
				callback(arStack.active().id, tx, step, index, "");
				ioc = true;
			}
		}

		//if(debug){
		//	console.log("step.op=" + step.op + "\t\t(" + arStack.active().id + " [" + arStack.count(arStack.active().id) + "]) " +
		//		((ioc) ? " <<< IOC Detected " : ""));
		//}
		ioc = false;
	});	
}

// --------------------------------------------------------------------------------------

CompactReentrancyIoCDetector.prototype.getIoCName = function(){ return "Reentrancy"; }

// --------------------------------------------------------------------------------------

module.exports = CompactReentrancyIoCDetector;

// --------------------------------------------------------------------------------------
