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

class TxAnalyser {
	constructor(tx, trace){
		this.tx = tx;
		this.trace = trace;

	}
}

// ---------------------------------------------------------------------------------------

/**
 * Returns a list of account addresses which have been directly or indirectly effected by 
 * the execution of the provided transaction.
 *
 * The transaction represented by txhash is re-executed in order to provide the list of 
 * accounts effected by internal message calls.
 * https://ethereum.stackexchange.com/questions/3417
 *
 * @param tx The transaction to be considered for analysis.
 * @returns The list of accounts effected by the executon of the transaction.
 */
TxAnalyser.prototype.effectedAccounts = async function(){
	var result = [];
	// TODO
	return result;
}

// ---------------------------------------------------------------------------------------

/**
 * Returns given input string split in method name and parameters.
 *
 * @return Given input string split in metjod name and parameters.
 */
TxAnalyser.prototype.input = function(){
	if(!this.tx){ return []; }
	var result = {};
	result.name = this.tx.input.substring(0,10);		// ex: 0x27ee58a6
	var params = this.tx.input.substring(10, this.tx.input.length);	
	result.params = params.match(/.{1,64}/g);
	result.params.forEach(function(e, i){ result.params[i] = "0x" + e; });
	return result;
}

// ---------------------------------------------------------------------------------------

module.exports = TxAnalyser;

// ---------------------------------------------------------------------------------------