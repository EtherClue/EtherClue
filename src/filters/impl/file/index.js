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
 * @version     2.0
 * @since		2.0
 */

// ---------------------------------------------------------------------------------------

var fs = require('fs');
const neatCsv = require('neat-csv');

// ---------------------------------------------------------------------------------------

/**
 * file - path to file containing transaction details.
 */
class FileFilter {
	constructor(options){
		this.logger = options.logger;
		this.path = options.path;
		this.address = options.address;
		this.from = parseInt(options.from);
		this.to = parseInt(options.to);
	}
}

// ---------------------------------------------------------------------------------------

/**
 * 
 */
FileFilter.prototype.txList = async function(){

	var _self = this;

	const str = fs.readFileSync(this.path, "utf8");
	const csv = await neatCsv(str);

	var txs = [];

	csv.forEach(function(line){
		if(line['contract'] == _self.address){
			var blocknum = parseInt(line['blocknum']);
			if(blocknum >= _self.from && blocknum <= _self.to){
				var tx = {
					blockNumber : line['blocknum'],
					hash : line['txhash'],
				}
				if(line['from']){ tx['from'] = line['from']; }
				if(line['to']){ tx['to'] = line['to']; }
				
				txs.push(tx);
			}
		}
	});

	return txs;
}

// ---------------------------------------------------------------------------------------

FileFilter.prototype.toString = async function(){
	return "FileFilter";
}

// ---------------------------------------------------------------------------------------

module.exports = FileFilter;

// ---------------------------------------------------------------------------------------
