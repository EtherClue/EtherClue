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

var fs = require('fs');
const neatCsv = require('neat-csv');

const Web3 		= require('web3');
const {Debug} 	= require('web3-eth-debug');

// ---------------------------------------------------------------------------------------

async function main(){

	var _self = this;

	var path = "./input.txt";
	var provider = "https://api.archivenode.io/l85bj3p75udgc103ur8tl85bj3p7cuof/turbogeth";

	var web3 = new Web3(new Web3.providers.HttpProvider(provider));
	var debug = new Debug(new Web3.providers.HttpProvider(provider));

	const str = fs.readFileSync(path, "utf8");
	const csv = await neatCsv(str);

	var records = 0, statusTrue = 0, statusFalse = 0;
	for(const line of csv){
		records++;
		var hash = line['hash'];
		var receipt = await web3.eth.getTransactionReceipt(hash);
		if(receipt.status == true){ statusTrue++; }
		else{ statusFalse++; }
		console.log(hash + " " + (receipt.status == true ? "" : "*") );
	}
	console.log("Total Records: " + records);
	console.log("Status True: " + statusTrue);
	console.log("Status False: " + statusFalse);
}

// ---------------------------------------------------------------------------------------

main();
