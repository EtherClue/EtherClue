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
 * @version     2.1
 * @since		1.0
 */

// --------------------------------------------------------------------------------------

const ActivationRecord 	= require("./ActivationRecord");
const Op 				= require("./").create("Op");

const CREATE_ADDRESS	= "0x0???????????????????????????????????????";

// --------------------------------------------------------------------------------------

/**
 * Represention of an Activation Record Stack (A).
 * 
 * 		A = A | EXC . A
 * 		A = AR . A | ε
 * 
 * Where:
 * 
 * 		A 	- represents the activation record stack.
 * 		AR 	- represents an activation record.
 * 		ε 	- represents the empty set.
 * 		EXC	- represents an exception.
 * 
 * This class provides helper functions to;
 * 	(a) automatically detect when a new activation record is to be added or removed.
 *  (b) return the current active activation record.
 * 	(c) return if an address is the current loaded address.
 * 	(d) return if an address is the current in-context address
 * 	(e) provide the number of activation records in which an address is in-context.
 * 
 * @param tx	The transaction in execution.
 * @param trace	Optional full trace. Will perform look ahead within trace when
 * 				required (example, when given a CREATE step).
 */
class ARStack {
	constructor(tx, trace){

		this.entries = [];		// A.

		// Initialise first entries in the activation record stack. Note how activation
		// records are stored in inverse order, i.e. - current activation record (that
		// is the active record) is always at position 0.

		// previous activation record.
		this.entries[0] = new ActivationRecord(tx.from.toLowerCase(), tx.from.toLowerCase());
		// current (active) activation record.
		this.entries[1] = new ActivationRecord(tx.to.toLowerCase(), tx.to.toLowerCase());

		// Log first call.
		//console.log(" > " + "CALL" + " from [0] " + tx.from.toLowerCase() 
		//						 + " to [1] " + tx.to.toLowerCase() 
		//						 + " (context:" + tx.to.toLowerCase() + ")");

		// Full stack trace, used for any look-ahead if required.
		this.trace = trace;

		// Store the current evm step reached by the consider function.
		this.vmstep = 0;
	}
}

// --------------------------------------------------------------------------------------

/**
 * Considers a single trace step and determines if this is to be appended to the current
 * active activation record or else if a new activation record needs to be created. For 
 * DELEGATECALL and CALLCODE the context of the new activation record remains the same 
 * as that of the previous activation record.
 * 
 * @param step	The trace step to be considered.
 */
ARStack.prototype.consider = function(step){

	this.vmstep = this.vmstep + 1;

	if(this.active().steps.length > 0){

		var prevDepth = this.active().nthStep(0).depth;
		var currDepth = step.depth;

		// We add a new activation record when depth increases.
		if(prevDepth < currDepth){

			var op = this.active().nthStep(0).op;
			var context, to, from = this.active().loadedAddress;
			var stack = this.active().nthStep(0).stack;
			var to = "0x" + stack[stack.length - 2].slice(24);
			to = to.toLowerCase();
			context = to;
			if(Op.isDELEGATECALL(op) || Op.isCALLCODE(op)){
				context = this.active().contextAddress;;
			}
			if(Op.isCREATE(op) || Op.isCREATE2(op)){
				to = CREATE_ADDRESS;
				context = CREATE_ADDRESS;
				// If trace is provided then we perform a look-ahead to identify the 
				// address of the newly created contract account. We can find this 
				// on the stack once execution returns to the caller contract account,
				// i.e. - the one that issued the CREATE statement.
				if(this.trace){
					for(i = this.vmstep + 1; i < this.trace.structLogs.length; i++){
						if(this.trace.structLogs[i].depth == prevDepth){
							var stack = this.trace.structLogs[i].stack;
							to = "0x" + stack[stack.length - 1].slice(24);
							context = to;
							break;
						}
					}
				}
			}
			var ar = new ActivationRecord(context, to);
			this.entries.push(ar);

			// Log activation record change.
			//console.log(" > " + op + " from [" + prevDepth + "] " + from 
			//						 + " to [" + currDepth + "] " + to 
			//						 + " (context:" + context + ")");
		}
		// Or remove an activation record if depth decreases.
		else if(prevDepth > currDepth){
			var op = this.active().nthStep(0).op;
			var ar =  this.entries.pop();
			var from = ar.loadedAddress;
			var context = this.active().contextAddress;
			var to = this.active().loadedAddress;

			// If trace is not provided then no-look ahead will have been done and 
			// therefore we identify the new contract address now. Note that this is not
			// ideal as address might not always be able to be used for vulnerability 
			// detection when detected at this stage.
			if(from == CREATE_ADDRESS){
				from = "0x" + step.stack[step.stack.length - 1].slice(24);
				// console.log(" ! " + CREATE_ADDRESS + " = " + from);
			}

			// Log activation record change.
			//console.log(" < " + op + " from [" + prevDepth + "] " + from 
			//						 + " to [" + currDepth + "] " + to 
			//						 + " (context:" + context + ")");
		}
	}

	// Set the current step in the active activation record.
	this.active().consider(step);
}

// --------------------------------------------------------------------------------------

/**
 * Return number of activation records that have the given contract account address in 
 * context.
 * 
 * @param address	The address used for search. 
 * @returns	Number of activation records that have the given contract account address 
 * 			in context.
 */
ARStack.prototype.isInContextCount = function(address){
	var count = 0;
	this.entries.forEach(function(activationRecord, index){
		if(activationRecord.contextAddress === address.toLowerCase()){
			count++;
		}
	});
	return count;
}

// --------------------------------------------------------------------------------------

/**
 * Checks if the address of the contract account in execution is the same as the given
 * contract account address.
 * 
 * @param address	The contract account address used for the check. 
 * @returns	True if the given contract account address is the contract account in 
 * 			execution, otherwise false. 
 */
ARStack.prototype.isInExecution = function(address){
	return this.active().loadedAddress === address.toLowerCase();
}

// --------------------------------------------------------------------------------------

/**
 * Checks if the address of the contract account in context is the same as the given
 * contract account address.
 * 
 * @param address	The contract account address used for the check. 
 * @returns	True if the given contract account address is the contract account in 
 * 			context, otherwise false. 
 */
ARStack.prototype.isInContext = function(address){
	return this.active().contextAddress === address.toLowerCase();
}

// --------------------------------------------------------------------------------------

/**
 * Returns the current active activation record, i.e. - the activation record of the 
 * contract account currently in execution.
 * 
 * @returns The current active activation record.
 */
 ARStack.prototype.active = function(){
	return this.entries[this.entries.length - 1];
}

// --------------------------------------------------------------------------------------

module.exports = ARStack;

// --------------------------------------------------------------------------------------