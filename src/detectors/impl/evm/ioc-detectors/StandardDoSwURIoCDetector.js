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
const ARStack 		= require("etherclue-helpers/ARStack");
const BigInt 		= require("big-integer");

// --------------------------------------------------------------------------------------

class StandardDoSWithUnexpectedRevertIoCDetector {}

// --------------------------------------------------------------------------------------

StandardDoSWithUnexpectedRevertIoCDetector.prototype.consider = 
						function(address, tx, trace, callback){
	if(!callback) return;
	var arStack = new ARStack(tx);	
	trace.structLogs.forEach(function(step,index){

		// Update activation record stack.
		arStack.consider(step);

		// Exit current iteration if not in target contract account.
		if(address && !arStack.isActive(address)) { return; }

		// Check if we returned from a call.
		if(arStack.active().steps.length > 1){
			var previousStep = arStack.active().nthStep(1);
			if(previousStep.op === Op.CALL){
				var stackAfter = step.stack;
				var r = BigInt(stackAfter[stackAfter.length - 1], 16);
				// Check if the result is an IoC for DoS.
				if(r.eq(0)){
					trace.structLogs.forEach(function(step2, i){
						if(step2.pc == 940 || step2.pc == 941){
							console.log(i + " - " + step2.op + " - " + step2.stack);
						}
					});
					//console.log(previousStep);
					callback(arStack.active().id, tx, 
							previousStep, index, "");
				}
			}
		}
	});
}

// --------------------------------------------------------------------------------------

StandardDoSWithUnexpectedRevertIoCDetector.prototype.getIoCName = function(){ 
	return "DoS with (Unexpected) Revert"; 
}

// --------------------------------------------------------------------------------------

module.exports = StandardDoSWithUnexpectedRevertIoCDetector;

// --------------------------------------------------------------------------------------
