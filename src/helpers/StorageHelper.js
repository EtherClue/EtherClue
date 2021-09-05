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

const BigInt 	= require("big-integer");
const Web3 		= require("Web3");

// --------------------------------------------------------------------------------------

/**
 * 
 */
class StorageSpace {
	constructor(){
		this.web3 = new Web3();
	}
}

// --------------------------------------------------------------------------------------

/**
 * 
 * @param {*} index 
 */
StorageSpace.prototype.basicTypeId = function(index){
	var base16 = BigInt(index).toString(16);
	return "0x" + this.web3.utils.padLeft(base16, 64);
}

// --------------------------------------------------------------------------------------

/**
 * 
 * @param {*} key 
 * @param {*} index 
 */
StorageSpace.prototype.mappingEntryId = function(key, index){

	// The below four lines managed to replicate same results as found in the link below.
	// https://ethereum.stackexchange.com/questions/41241/how-are-mappings-found-in-storage-in-geth
	// Remeber that geth web3 implementation provides different results than web3 javascript implementation.
	// While geth web3 sha3 function takes { "encoding" : "hex"} as extra parameter, in web3 javascript we need to
	// add "0x" after the key and index values are combined.
	//key = "00000000000000000000000046fb9a22689c4a4bfb494baeafbb8b2993725305";
	//index = "0000000000000000000000000000000000000000000000000000000000000001";
	//bn=web3.utils.sha3("0x00000000000000000000000046fb9a22689c4a4bfb494baeafbb8b29937253050000000000000000000000000000000000000000000000000000000000000001");
	//console.log(bn);
	// This is version which works in geth console.
	//web3.sha3("00000000000000000000000046fb9a22689c4a4bfb494baeafbb8b29937253050000000000000000000000000000000000000000000000000000000000000001", {"encoding": "hex"}) 

	//console.log(key);
	//console.log(index);

	key = this.web3.utils.padLeft(key, 64).replace("0x", "");
	index = this.web3.utils.padLeft(index, 64).replace("0x", "");
	var join = "0x" + key + index;
	var hash = this.web3.utils.sha3(join);
	
	//console.log(join);
	//console.log(hash);

	return hash;
}

// --------------------------------------------------------------------------------------

module.exports = StorageSpace;

// --------------------------------------------------------------------------------------