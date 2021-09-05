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

// --------------------------------------------------------------------------------------

// Underflow IoC Detector.

// --------------------------------------------------------------------------------------

const Op 			= require("etherclue-helpers").create("Op");
const ExprType 		= require("etherclue-helpers").create("ExprType");
const ARStack 		= require("etherclue-helpers/ARStack");
const CAInfo		= require("etherclue-helpers/CAInfo");
const BigInt 		= require("big-integer");

// --------------------------------------------------------------------------------------

class StandardUnderflowIoCDetector {}

// --------------------------------------------------------------------------------------

StandardUnderflowIoCDetector.prototype.tracerconfig = function(){

	return {disableStack: false, disableMemory: true, disableStorage: true};

}

// --------------------------------------------------------------------------------------

StandardUnderflowIoCDetector.prototype.consider = function(address, tx, trace, callback){
	
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
					(	previous.op === Op.SUB
					)
			){
				if(caInfo[arStack.active().id].consider(previous.pc)){
					candidates.push({
						address: arStack.active.id,
						op: previous.op, 
						pc: previous.pc,
						exprType: caInfo[arStack.active().id].getExprTypeAt(previous.pc),
						// Stack, Memory and Storage arrays need to be reversed before use
						// as debug_traceTransact output provides these in inverse order.
						//stackBefore: [].concat(previous.stack).reverse(), 
						//stackAfter: [].concat(current.stack).reverse(),
						stackBefore: previous.stack, 
						stackAfter: current.stack,
						// Used only for quick reference.
						step: previous,
						index: index }
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

		if(entry.op === Op.SUB){

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

StandardUnderflowIoCDetector.prototype.checkUnderlowOnSubUint8to256 = function(
		stackBefore, stackAfter, exprType){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[stackBefore.length-1], 16);
	var v = BigInt(stackAfter[stackAfter.length-1], 16);
	// Check if overflow.
	return v.greater(a);
}

// --------------------------------------------------------------------------------------

StandardUnderflowIoCDetector.prototype.checkUnderflowOnSubInt256 = function(
		stackBefore, stackAfter){
	// Retrieve values from previous and current stack.
	var a = BigInt(stackBefore[stackBefore.length-1], 16);
	var b = BigInt(stackBefore[stackBefore.length-2], 16);
	var v = BigInt(stackAfter[stackAfter.length-1], 16);
	// Check if overflow (rule specific for int256).
	return	(b.greater(0) && v.greater(a)) || 
			(b.lesser(0) && v.lesser(a));
}

// --------------------------------------------------------------------------------------

StandardUnderflowIoCDetector.prototype.checkUnderflowOnSubInt8to128 = function(
		stackBefore, stackAfter, exprType){
	var v = BigInt(stackAfter[stackAfter.length-1], 16);
	return !(	v.greater(ExprType.min(exprType)) &&
				v.lesser(ExprType.max(exprType)));
}

// --------------------------------------------------------------------------------------

StandardUnderflowIoCDetector.prototype.getIoCName = function(){ return "Underflow"; }

// --------------------------------------------------------------------------------------

module.exports = StandardUnderflowIoCDetector;

// --------------------------------------------------------------------------------------
