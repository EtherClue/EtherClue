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

// Underflow IoC Detector.

// --------------------------------------------------------------------------------------

const Op 			= require("etherclue-helpers").create("Op");
const ExprType 		= require("etherclue-helpers").create("ExprType");
const CAInfo		= require("etherclue-helpers/CAInfo");
const BigInt 		= require("big-integer");

// --------------------------------------------------------------------------------------

class GethUnderflowIoCDetector {}

// --------------------------------------------------------------------------------------

GethUnderflowIoCDetector.prototype.tracerconfig = function(caAddress){

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

GethUnderflowIoCDetector.prototype.tracer = function(){

	var tracer = { 

		structLogs: [],

		entry : null,

		s : 0,
		
		step: function(log, db) { 

			this.s = this.s + 1;

			if(toHex(log.contract.getAddress()) == '{address}') {
				if(log.op.toString() == 'SUB'){
					this.entry = {};
					this.entry['address'] = toHex(log.contract.getAddress());
					this.entry['op'] = log.op.toString();
					this.entry['stackBefore'] = [log.stack.peek(0).toString(16), log.stack.peek(1).toString(16)];
					this.entry['pc'] = log.getPC();
					this.entry['step'] = this.s;
					this.entry['depth'] = log.getDepth();
					return;
				};
				if(this.entry){
					this.entry['stackAfter'] = [log.stack.peek(0).toString(16)];
					this.structLogs.push(this.entry);
					this.entry = null;
					return;
				};
			};
		}, 

		fault: function(log, db) {}, 

		result: function(ctx, db) { 
			return {structLogs : this.structLogs};
		}, 
	};

	return tracer;
}

// --------------------------------------------------------------------------------------

GethUnderflowIoCDetector.prototype.consider = function(address, tx, trace, callback){

	// If not callback is set then no need to apply any further logic.
	if(!callback) return;

	var _self = this;

	var result = false;

	var caInfo = new CAInfo();
	caInfo.resetTo(address, true);

	trace.structLogs.forEach(function(entry, index){
		//console.log(entry);
		
		if(!caInfo.consider(entry.pc)){ return; }		
		
		var exprType = caInfo.getExprTypeAt(entry.pc);
		entry['exprType'] = exprType;

		if(ExprType.isSigned(entry.exprType)){
			if(ExprType.isInt256(entry.exprType)){	// Int256
				result = _self.checkUnderflowOnSubInt256(
					entry.stackBefore, entry.stackAfter);
			}
			else{	// Int8 to Int128
				result = _self.checkUnderflowOnSubInt8to128(
					entry.stackBefore, entry.stackAfter, entry.exprType);
			}
		}
		else{	// Not Signed.
			// Uint8 to Uint256
			result = _self.checkUnderlowOnSubUint8to256(
				entry.stackBefore, entry.stackAfter, entry.exprType);
		}

		if(result){

			// Call callback function.	
			callback(
				entry.address,
				tx,
				entry,
				entry.step,
				"exprType="+entry.exprType);

			// Reset call.
			result = false;			
		}
	});
}

// --------------------------------------------------------------------------------------

GethUnderflowIoCDetector.prototype.checkUnderlowOnSubUint8to256 = function(
		stackBefore, stackAfter, exprType){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[0], 16);
	var v = BigInt(stackAfter[0], 16);

	// Check if overflow.
	return v.greater(a);
}

// --------------------------------------------------------------------------------------

GethUnderflowIoCDetector.prototype.checkUnderflowOnSubInt256 = function(
		stackBefore, stackAfter){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[0], 16);
	var b = BigInt(stackBefore[1], 16);
	var v = BigInt(stackAfter[0], 16);
	// Check if overflow (rule specific for int256).
	return	(b.greater(0) && v.greater(a)) || 
			(b.lesser(0) && v.lesser(a));
}

// --------------------------------------------------------------------------------------

GethUnderflowIoCDetector.prototype.checkUnderflowOnSubInt8to128 = function(
		stackBefore, stackAfter, exprType){
	var v = BigInt(stackAfter[0], 16);
	return !(	v.greater(ExprType.min(exprType)) &&
				v.lesser(ExprType.max(exprType)));
}

// --------------------------------------------------------------------------------------

GethUnderflowIoCDetector.prototype.getIoCName = function(){ return "Underflow"; }

// --------------------------------------------------------------------------------------

module.exports = GethUnderflowIoCDetector;

// --------------------------------------------------------------------------------------
