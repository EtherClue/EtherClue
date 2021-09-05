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

// Overflow IoC Detector.

// --------------------------------------------------------------------------------------

const Op 			= require("etherclue-helpers").create("Op");
const ExprType 		= require("etherclue-helpers").create("ExprType");
const ARStack 		= require("etherclue-helpers/ARStack");
const CAInfo		= require("etherclue-helpers/CAInfo");
const BigInt 		= require("big-integer");

// --------------------------------------------------------------------------------------

class CompactOverflowIoCDetector {}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.tracerconfig = function(caAddress){

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

CompactOverflowIoCDetector.prototype.tracer = function(){

	var tracer = { 

		structLogs: [],

		previous: {depth : 1},

		traceStep: 0,

		step: function(log, db) {

			if(this.previous['depth'] < log.getDepth()){
				entry = {};
				entry['o'] = 'C';
				entry['d'] = this.previous['depth'];
				entry['p'] = this.previous['pc'];
				entry['t'] = this.previous['traceStep'];
				entry['a'] = this.previous['stack'][0];
				this.structLogs.push(entry);			
			}	
			else if(this.previous['depth'] > log.getDepth()){
				entry = {};
				entry['o'] = 'R';
				entry['d'] = this.previous['depth'];
				entry['p'] = this.previous['pc'];
				entry['t'] = this.previous['traceStep'];
				this.structLogs.push(entry);			
			}		
			else{
				caddr = toHex(log.contract.getAddress());
				if(caddr == '{address}'){
					if(this.previous['op'] == 'ADD'){
						entry = {};
						entry['o'] = 'A';
						entry['d'] = this.previous['depth'];
						entry['p'] = this.previous['pc'];
						entry['t'] = this.previous['traceStep'];
						entry['b'] = this.previous['stack'];
						entry['a'] = log.stack.peek(0);
						this.structLogs.push(entry);
					}
					else if(this.previous['op'] == 'MUL'){
						entry = {};
						entry['o'] = 'M';
						entry['d'] = this.previous['depth'];
						entry['p'] = this.previous['pc'];
						entry['t'] = this.previous['traceStep'];
						entry['b'] = this.previous['stack'];
						entry['a'] = log.stack.peek(0);
						this.structLogs.push(entry);
					}
					else if(this.previous['op'] == 'DIV'){
						entry = {};
						entry['o'] = 'D';
						entry['d'] = this.previous['depth'];
						entry['p'] = this.previous['pc'];
						entry['t'] = this.previous['traceStep'];
						entry['b'] = this.previous['stack'];
						entry['a'] = log.stack.peek(0);
						this.structLogs.push(entry);
					}
				}
			}
			this.previous['traceStep'] = this.traceStep;
			this.previous['op'] = log.op.toString();
			this.previous['stack'] = [log.stack.peek(1), log.stack.peek(0)];
			this.previous['pc'] = log.getPC();
			this.previous['depth'] = log.getDepth();
			this.traceStep = this.traceStep + 1;
		}, 

		fault: function(log, db) {}, 

		result: function(ctx, db) { 
			return { structLogs : this.structLogs };
		}, 
	};

	return tracer;
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.explodeTrace = function(compactTrace){ 

	var rebuiltTrace = [];
	
	compactTrace.forEach(function(compactStep, index){
		//console.log(compactStep);

		var entry = {};
		if(compactStep['o'] == 'C'){		entry['op'] = "CALL";}
		else if (compactStep['o'] == 'R'){ 	entry['op'] = "RETURN"; }
		else if (compactStep['o'] == 'A'){ 	entry['op'] = "ADD"; }
		else if (compactStep['o'] == 'M'){ 	entry['op'] = "MUL"; }
		else if (compactStep['o'] == 'D'){ 	entry['op'] = "DIV"; }
		else if (compactStep['o'] == 'N'){ 	entry['op'] = "NOTIMP"; }
		entry['depth'] 	= compactStep['d'];
		entry['pc'] 	= compactStep['p'];
		entry['step'] 	= compactStep['t'];
		if(compactStep['o'] == 'C'){
			entry['stack'] = ['000000000000000000000000' + BigInt(compactStep['a'], 10).toString(16), 'NOTIMP'];
			// Add an extra step.
			extra = {}; extra['op'] = "NOTIMP"; extra['pc'] = entry['pc'] - 1;
				extra['step'] = entry['step'] - 1; extra['depth'] = entry['depth'];
			rebuiltTrace.push(extra);
		 }
		 rebuiltTrace.push(entry);
		 if(compactStep['o'] != 'R'){
			entry['stack'] = compactStep['b'];	
			extra = {}; extra['op'] = "NOTIMP"; extra['pc'] = entry['pc'] + 1;
				extra['step'] = entry['step'] + 1; extra['depth'] = entry['depth'];
				extra['stack'] = [ compactStep['a'] ];
			rebuiltTrace.push(extra);		
		 }
	});

	return rebuiltTrace;
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.consider = function(address, tx, trace, callback){
	
	// If not callback is set then no need to apply any further logic.
	if(!callback) return;

	// Reference to prototype object.
	var _self = this;

	// Helper class used to keep track of the activation records throughout the 
	// execution of the transaction trace.
	var arStack = new ARStack(tx);

	// Store previous and current step.
	var previous = null, current = null;
	
	// Store candidates to look for possible IoCs.
	var candidates = [];

	// Used to get type information from contract account.
	var caInfo = {};

	// Explode the retrieved trace in something that the IoC can process.
	trace.structLogs = this.explodeTrace(trace.structLogs, address);

	// Loop through the execution of the transaction trace. This first loop simulates
	// the identification of candidate records that need to be checked for indicators
	// of compromise. Here the expression type for the candidate records is loaded 
	// from an external file. However in truth this could also be constructed to taint 
	// analyses. 
	trace.structLogs.forEach(function(step, index){

		// Only apply check logic if wanted activation record is active.
		if(!address || (address && arStack.isActive(address))){
			
			if(!caInfo[arStack.active().id]){
				caInfo[arStack.active().id] = new CAInfo();
				caInfo[arStack.active().id].resetTo(arStack.active().id, true);
			}

			previous = current;
			current = step;

			if(		previous &&
					(	previous.op === Op.ADD || 
						previous.op === Op.MUL || 
						previous.op === Op.DIV
					)
			){
				//console.log("> " + arStack.active().id + ", op: " + previous.op + ", pc: " + previous.pc + ", exprType: " + caInfo[arStack.active().id].getExprTypeAt(previous.pc));

				if(caInfo[arStack.active().id].consider(previous.pc)){
					candidates.push({
						address: arStack.active.id,
						op: previous.op, 
						pc: previous.pc,
						exprType: caInfo[arStack.active().id].getExprTypeAt(previous.pc),
						// Stack, Memory and Storage arrays need to be reversed before use
						// as debug_traceTransact output provides these in inverse order.
						stackBefore: [].concat(previous.stack).reverse(), 
						stackAfter: [].concat(current.stack).reverse(),
						// Used only for quick reference.
						step: previous,
						index: previous.step }
					);
				}
			}
		}

		// Update activation record stack.
		arStack.consider(step);		
	});

	//
	// From this point on we decide which IoC detection rule to apply.
	//

	// Used to determine which call to make.
	var result = false;

	// Loop through all candidate records that need to be checked.
	candidates.forEach(function(entry, index){

		if(entry.op === Op.ADD){

			if(ExprType.isSigned(entry.exprType)){
				if(ExprType.isInt256(entry.exprType)){	// Int256
					result = _self.checkOverflowOnAddInt256(
						entry.stackBefore, entry.stackAfter);
				}
				else{	// Int8 to Int128
					result = _self.checkOverflowOnAddInt8to128(
						entry.stackBefore, entry.stackAfter, entry.exprType);
				}
			}
			else{
				if(ExprType.isUint256(entry.exprType)){	// Uint256
					result = _self.checkOverflowOnAddUint256(
						entry.stackBefore, entry.stackAfter);
				}
				else{	// Uint8 to Uint128
					result = _self.checkOverflowOnAddUint8to128(
						entry.stackBefore, entry.stackAfter, entry.exprType);
				}
			}
		}
		else if(entry.op === Op.MUL){

			if(ExprType.isSigned(entry.exprType)){
				if(ExprType.isInt256(entry.exprType)){	// Int256
					result = _self.checkOverflowOnMulInt256(
						entry.stackBefore, entry.stackAfter);
				}
				else{	// Int8 to Int128
					result = _self.checkOverflowOnMulInt8to128(
						entry.stackBefore, entry.stackAfter, entry.exprType);
				}
			}
			else{
				if(ExprType.isUint256(entry.exprType)){	// Uint256
					result = _self.checkOverflowOnMulUint256(
						entry.stackBefore, entry.stackAfter);
				}
				else{	// Uint8 to Uint128
					result = _self.checkOverflowOnMulUint8to128(
						entry.stackBefore, entry.stackAfter, entry.exprType);
				}
			}
		}
		else if(entry.op === Op.DIV){

			if(ExprType.isSigned(entry.exprType)){
				call = _self.checkOverflowOnDivInt8to256;
			}
		}

		// Check if an IoC has been found.
		if(result){
			// Call callback function.	
			callback(
				entry.address,
				tx,
				entry.step,
				entry.index,
				"exprType="+entry.exprType);
			// Reset call.
			result = false;
		}
	});

}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnAddUint256 = function(
		stackBefore, stackAfter){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[0], 16);
	var v = BigInt(stackAfter[0], 16);
	// Check if overflow.
	return v.lesser(a);
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnAddUint8to128 = function(
		stackBefore, stackAfter, exprType){
	var v = BigInt(stackAfter[0], 16);
	return v.greater(ExprType.max(exprType));
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnMulUint256 = function(
		stackBefore, stackAfter){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[0], 16);
	var b = BigInt(stackBefore[1], 16);
	if(a == 0 || b == 0) return false;
	var v = BigInt(stackAfter[0], 16);
	return (v.divide(a)).compare(b);
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnMulUint8to128 = function(
		stackBefore, stackAfter){
	return this.checkOverflowOnAddUint8to128(stackBefore, stackAfter);
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnAddInt256 = function(
		stackBefore, stackAfter){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[0], 16);
	var b = BigInt(stackBefore[1], 16);
	var v = BigInt(stackAfter[0], 16);
	// Check if overflow (rule specific for int256).
	return	(b.greater(0) && v.lesser(a)) || 
			(b.lesser(0) && v.greater(a));
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnAddInt8to128 = function(
		stackBefore, stackAfter, exprType){
	var v = BigInt(stackAfter[0], 16);
	return !(	v.greater(ExprType.min(exprType)) &&
				v.lesser(ExprType.max(exprType)));
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnMulInt256 = function(
		stackBefore, stackAfter){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[0], 16);
	var b = BigInt(stackBefore[1], 16);
	if(a == 0 || b == 0) return false;
	var v = BigInt(stackAfter[0], 16);
	if(	(a == -1 && b == ExprType.min(ExprType.Int256)) ||
		(b == -1 && a == ExprType.min(ExprType.Int256))		){ return true; }
	return (v.divide(a)).compare(b);
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnMulInt8to128 = function(
		stackBefore, stackAfter){
	return this.checkOverflowOnAddInt8to256(stackBefore, stackAfter);
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.checkOverflowOnDivInt8to256 = function(
		stackBefore, stackAfter, exprType){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[0], 16);
	var b = BigInt(stackBefore[1], 16);
	return a == -1 && b == ExprType.min(exprType);
}

// --------------------------------------------------------------------------------------

CompactOverflowIoCDetector.prototype.getIoCName = function(){ return "Overflow"; }

// --------------------------------------------------------------------------------------

module.exports = CompactOverflowIoCDetector;

// --------------------------------------------------------------------------------------
