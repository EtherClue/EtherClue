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

const Op 		= require("etherclue-helpers").create("Op");
const ARStack 	= require("etherclue-helpers/ARStack");
const CAInfo	= require("etherclue-helpers/CAInfo");

// --------------------------------------------------------------------------------------

/**
 * Standard Reentracy IoC detection pattern.
 * 
 * Retrieves a transaction trace (storage off, memory off, stack on) and looks for 
 * reentrancy IoCs within this.
 */
class StandardReentrancyIoCDetector {}

// --------------------------------------------------------------------------------------

/**
 * Builds a custom tracer sent as part of the debug_traceTransact call.
 * 
 * The custom tracer will instruct the remote node not to send storage and memory 
 * changes as part of the payload sent back as these are not used by the Reentrancy IoC
 * detection pattern.
 * 
 * @param address	The address of the vulnerable contract account. 
 * @returns	The custom tracer sent as part of the debug_traceTransact call. 
 */
StandardReentrancyIoCDetector.prototype.tracerconfig = function(address){

	extraconfig = {timeout: "120s", disableStorage : true, disableMemory: true, disableStack: false };
	return extraconfig;
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
StandardReentrancyIoCDetector.prototype.consider = function(address, tx, trace, callback){
	
	// Set debug true to get extra info printed on screen.
	var debug = false, ioc = false;
	
	// Load contract account meta-information.
	var caInfo = new CAInfo();
	caInfo.resetTo(address, true);

	if(!callback) return;
	var arStack = new ARStack(tx, trace);
	trace.structLogs.forEach(function(step,index){
		
		// Update activation record stack.
		arStack.consider(step);

		// Exit current iteration if not in target contract account.
		if(address && !arStack.isInExecution(address)) { return; }

		// Check if step is to be considered.
		if(!caInfo.consider(step.pc)){ return; }

		// Check if a reentrancy has occurd.
		if(step.op === Op.SSTORE){

			// If the contract account in-execution and in-context is the same then
			// we need to find at least one other activation record in which the 
			// vulnerable contract account was in-context.
			if(arStack.active().loadedAddress == arStack.active().contextAddress){

				if(arStack.isInContextCount(arStack.active().contextAddress) > 1){
					callback(arStack.active().loadedAddress, tx, step, index, "");
					ioc = true;
				}

			}
	
			// Otheriwse, if the contract account in-execution is not the same as the 
			// contract account in-context then we need to find at least two other 
			// activation records in which the vulnerable contract account was 
			// in-context.		
			else{
		
				if(arStack.isInContextCount(arStack.active().contextAddress) > 2){
					callback(arStack.active().id, tx, step, index, "");
					ioc = true;
				}

			}
		}

		if(debug){
			console.log("step.op=" + step.op + "\t\t(" + arStack.active().id + " [" + arStack.count(arStack.active().id) + "]) " +
				((ioc) ? " <<< IOC Detected " : ""));
		}
		ioc = false;
		
	});	
}

// --------------------------------------------------------------------------------------

/**
 * Returns the name of the IoC detector.
 * 
 * @returns Name of this IoC detector.
 */
StandardReentrancyIoCDetector.prototype.getIoCName = function(){ return "Reentrancy"; }

// --------------------------------------------------------------------------------------

module.exports = StandardReentrancyIoCDetector;

// --------------------------------------------------------------------------------------
