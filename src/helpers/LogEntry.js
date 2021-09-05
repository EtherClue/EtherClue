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

const Keccak256 = require("keccak256");

// --------------------------------------------------------------------------------------

/**
 * Helper class to handle Transaction Receipts log entries.
 * 
 * @param entry	Log entry details.
 */
class LogEntry {
	constructor(entry){
		this.entry = entry;
	}
}
// --------------------------------------------------------------------------------------

/**
 * Returns log entry as is.
 * @returns Log entry.
 */
LogEntry.prototype.raw = function(){
	return this.entry;
}

// --------------------------------------------------------------------------------------

/**
 * Check if log entry is from the given address.
 * @param address	Address to be checked if match to the one of the log entry.
 */
LogEntry.prototype.isFrom = function(address){
	return address.toLowerCase() == this.entry.address.toLowerCase();
}

// --------------------------------------------------------------------------------------

/**
 * Check if log entry topic is of given signature. The signature of a topic is the name
 * of the event with the parameter types in brackets, example; "myevent(uint256,uint8)".
 * 
 * @param sig	Signeture to check if match to the one of the log entry.
 */
LogEntry.prototype.ofType = function(sig){
	var hash = "0x" + Keccak256(sig).toString("hex");
	return hash == this.entry.topics[0];
}

// --------------------------------------------------------------------------------------

/**
 * Returns parameter at wanted position.
 * 
 * @param index	Position of wanted parameter.
 */
LogEntry.prototype.paramAt = function(index){
	var result = "0x" + this.entry.data.substring(2).substring(
		(64 * index), 64 * (index+1));
	return result;
}

// --------------------------------------------------------------------------------------

module.exports = LogEntry;

// --------------------------------------------------------------------------------------