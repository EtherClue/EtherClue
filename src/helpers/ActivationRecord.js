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

// ---------------------------------------------------------------------------------------


/**
 * Represention of an Activation Record (AR).
 * 
 * 		AR =〈c,id,M,pc,l,s〉
 * 
 * Where:
 * 
 * 		c 	- represents the context address (storage space updated).
 * 		id 	- represents the loaded address (contract account in execution).
 * 		M	- represents the code of the contract account in execution.
 * 		pc	- program counter.
 * 		l 	- memory.
 * 		s	- stack.
 * 
 * This original definition has been extended to include the context address to support
 * the DELEGATECALL and CALLCODE operations for which the contract account in context
 * might not be the same as the contract account in execution.
 * 
 * @param contextAddress	The contract account that is in context, i.e. - the contract 
 * 							account which storage space will be effected by an SSTORE / 
 * 							SLOAD operation.
 * @param loadedAddress		The contract account in execution, i.e. - M, pc, l and s are
 * 							in terms of the loaded address.
 */
class ActivationRecord {
	constructor(contextAddress, loadedAddress){
		this.contextAddress = contextAddress;	// c.
		this.loadedAddress = loadedAddress;		// id.
		this.steps = [];						// M, pc, l, s.
	}
}

// --------------------------------------------------------------------------------------

/**
 * Add a trace step to the activation record.
 * 
 * @param step	The trace step to be added to the activation record.
 */
ActivationRecord.prototype.consider = function(step){
	this.steps.push(step);
}

// --------------------------------------------------------------------------------------

/**
 * Returns the nth step in the activation record.
 * 
 * @param nth	The nth step to be returned.
 * @returns 	The step at location nth.
 */
ActivationRecord.prototype.nthStep = function(nth){
	return this.steps[this.steps.length - (nth + 1)];
}

// --------------------------------------------------------------------------------------

module.exports = ActivationRecord;

// --------------------------------------------------------------------------------------
