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
 * @since		2.0
 */

// --------------------------------------------------------------------------------------

// Geth Dummy IoC Detector.

// --------------------------------------------------------------------------------------

const Op 			= require("etherclue-helpers").create("Op");
const ExprType 		= require("etherclue-helpers").create("ExprType");
const CAInfo		= require("etherclue-helpers/CAInfo");
const BigInt 		= require("big-integer");

// --------------------------------------------------------------------------------------

class GethDummyIoCDetector {}

// --------------------------------------------------------------------------------------

GethDummyIoCDetector.prototype.tracerconfig = function(caAddress){

	var tracerObject = this.tracer();
	var tracerJson = JSON.stringify(tracerObject, function(key, val) {
		return (typeof val === 'function') ? '' + val : val;
	});
	var tracerString = tracerJson.replace(/"/g,"");
	tracerString = tracerString.replace(/(\\r\\n|\\n|\\r|\\t)/gm,"");
	tracerString = tracerString.replace(new RegExp("{address}", 'g'), ""+ caAddress + "");
	extraconfig = {timeout: "120s", tracer : tracerString };
	return extraconfig;	
}

// --------------------------------------------------------------------------------------

GethDummyIoCDetector.prototype.tracer = function(){

	var tracer = { 

		structLogs: [],

		entry : null,

		s : 0,
		
		step: function(log, db) { 

			this.structLogs.push(0);
			this.s = this.s + 1;

		}, 

		fault: function(log, db) {}, 

		result: function(ctx, db) { 
			return {structLogs : this.structLogs.length};
		}, 
	};

	return tracer;
}

// --------------------------------------------------------------------------------------

GethDummyIoCDetector.prototype.consider = function(address, tx, trace, callback){

	// If not callback is set then no need to apply any further logic.
	if(!callback) return;

	trace.structLogs.forEach(function(entry, index){
		console.log(entry);
	});

	return false;
}

// --------------------------------------------------------------------------------------

GethDummyIoCDetector.prototype.getIoCName = function(){ return "Dummy"; }

// --------------------------------------------------------------------------------------

module.exports = GethDummyIoCDetector;

// --------------------------------------------------------------------------------------
