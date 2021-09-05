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

const fs 		= require("fs");

// --------------------------------------------------------------------------------------

/**
 * Used to capture contract account meta information.
 */
class CAInfo {
	constructor(){
		this.json 		= null;
		this.loaded 	= false;
	}
}

// --------------------------------------------------------------------------------------

/**
 * Loads the meta information of a contract account. A file which name is in the format
 * '<address>.json' must be loacted in a directory named 'ca-info' in the application 
 * root.
 * 
 * @param address	The address of the contract account.
 */
CAInfo.prototype.resetTo = function(address){
	//console.log("RESET TO: " + address);
	var _self = this;
	// Reset information.
	this.json 	= {id: address, exprType:[{}], consider:[]};
	this.loaded = false;
	//console.log("CAInfo.for=" + address);
	if(this.loaded) { return; }
	// Try to load from cache file.
	var filename = "./ca-info/" + address + ".json";
	//console.log("CAInfo.loading.file=" + filename);
	try{
		var data = fs.readFileSync(filename);
		this.json = JSON.parse(data);
		this.loaded = true;
		//console.log("CAInfo.loading.ok");
		//console.log(this.json);
	}
	catch(err){
		//console.log("CAInfo.loading.error=" + err);
	}
}

// --------------------------------------------------------------------------------------

/**
 * Returns the expression type of the instruction at location pc.
 * 
 * @param pc The program counter value.
 * @returns The ExprType of the instruction at location pc.
 */
CAInfo.prototype.getExprTypeAt = function(pc){
	if(!this.json.exprType[pc]) return "uint256";
	else return this.json.exprType[pc];
}

// --------------------------------------------------------------------------------------

/**
 * Overrides the expression type at location pc.
 * 
 * @param pc		The program counter value. 
 * @param exprType 	The expression type value.
 */
CAInfo.prototype.setExprTypeAt = function(pc, exprType){
	this.json.exprType[pc] = exprType;
}

// --------------------------------------------------------------------------------------

/**
 * Returns true if an IoC detection rule should be applied at position pc.
 * 
 * @param pc	The program counter value.  
 * @returns 	True if rule is to be applied; otherwise false.
 */
CAInfo.prototype.consider = function(pc){
	if(this.json.consider.length == 0) return true;
	else {
		return this.json.consider.includes(pc);
	}
}

// --------------------------------------------------------------------------------------

/**
 * Returns true if a contract account meta data has been loaded.
 * 
 * @returns True if contract account meta data loaded; otherwise false.
 */
CAInfo.prototype.isLoaded = function(){
	return this.loaded;
}

// --------------------------------------------------------------------------------------

/**
 * Returns the meta data loaded for the contract account.
 * 
 * @returns	The JSON representing the meta data of the contract account. 
 */
CAInfo.prototype.metaData = function(){
	return this.json;
}

// --------------------------------------------------------------------------------------

module.exports = CAInfo;

// --------------------------------------------------------------------------------------
