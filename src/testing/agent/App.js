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

const commandLineArgs 	= require("command-line-args");
const commandLineUsage  = require("command-line-usage");
const keccak256 		= require("keccak256");
const path 				= require('path');
const fs 				= require('fs');
const uuidv4 			= require('uuid/v4');

const AgentObject		= require("./objects");
const EthereumLinker	= require("ethereum-linker");
const EthereumHelper	= require("ethereum-helper");

// ---------------------------------------------------------------------------------------

// Define supported options for the evm-level-ioc-d solution.
// TODO: Need to provide further information about each option which provides information on what the solution does.
const optionDefinitons = [

	{ name: "help",		alias: 'h', type: Boolean, description: "Display this usage guide." },

	// How solution will connect with the blockchain.
	// 	web3		: Only makes use of the information available on-chane.
	//			  Provides faster transaction tracing but slower to 
	//			  retrieve block level information. Note that not all
	//			  providers support transaction tracing.
	{ name: "linker",	alias: 'l', type: String, description: "Blockchain Interface (web3[provider=<?>])" },
	{ name: "profile",	alias: 'p', type: String,  description: "Web3 provider url." },
];

// ---------------------------------------------------------------------------------------

// Used to show help information to the user (in case -h or --help option is selected).
const usage = commandLineUsage([
	{
		header: 'Agent',
		content: 'Sends transactions to ethereum blockchain as per configured profiles.' 
	},
	{
		header: 'Options',
		optionList: optionDefinitons
	},
	{
		content: 'Project home: {underline https://gitlab.com/simonjaquilina/um-cs-masters-thesis}'
	}	
]);

// ---------------------------------------------------------------------------------------

Date.prototype.timeNow = function () {
	return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

// ---------------------------------------------------------------------------------------

function logInfo(text){
	var date = new Date();
	console.log("[info][" + date.timeNow() + "] " + text);	
}

// ---------------------------------------------------------------------------------------

function logError(text){
	var date = new Date();
	console.log("[error][" + date.timeNow() + "] " + text);	
}

// ---------------------------------------------------------------------------------------

// Retrieve options passed as command line arguments.
const options = commandLineArgs(optionDefinitons);

// Show help information if -h or --help option is selected.
if(options.help){ console.log(usage); return; }

// TODO: Remove this, this should be passed as command line argument.
options.linker = "web3[provider=http://localhost:8545,p=22]";
options.profile = "*";

// Here we set other options to which the user does not have access yet.
var linkerId, linkerArgs, l = options.linker.split("[");
linkerId = l[0]; linkerArgs = {};
var args = l[1].slice(0, l[1].length-1).split(",");
args.forEach(function(p){
	p = p.split("=");
	linkerArgs[p[0]]=p[1];
});

// ---------------------------------------------------------------------------------------

// Used to print information at end of run.
var startBlock;
var endBlock;

// ---------------------------------------------------------------------------------------

if(!options.runTime) { options.runTime = 300000; }
options.startTime = new Date();
options.endTime = options.startTime.getTime() + options.runTime;
options.endTime = new Date(options.endTime);

logInfo("Start time: " + options.startTime);
logInfo("End time: " + options.endTime);
logInfo("Duation: " + (
						parseInt(options.endTime.getTime()) - 
						parseInt(options.startTime.getTime()))
					  );

// ---------------------------------------------------------------------------------------

// Main loop which runs on an interval.
var mainLoop;

// ---------------------------------------------------------------------------------------

// Initialise blockchain linker.
var linker;
if(linkerId == "web3") { 
	linker =  EthereumLinker.create("Web3Linker", linkerArgs);
}
else {
	// Will try to load custom helper using handler id as path.
	linker =  EthereumLinker.create(linkerId, linkerArgs);
}

// ---------------------------------------------------------------------------------------

// Store all loaded profiles.
var profiles = [];

// ---------------------------------------------------------------------------------------

async function main() {

	// Variable decleration.
	var content, filePath, directoryPath, count = 0;

	// Get start block details.
	startBlock = await linker.getBlockNumber();	
	
	// Joining path of directory.
	directoryPath = path.join(__dirname, 'active');

	// Passsing directoryPath and callback function.
	fs.readdir(directoryPath, function (err, files){

		// Handling error.
		if(err){
			return logError('Unable to scan directory: ' + err);
		} 

		// Listing all files using forEach.
		files.forEach(function (file) {

			logInfo("Opening file " + file);

			// Joining file name to directory path.
			filePath = path.join(directoryPath, file);

			// Read file contents.
			content = fs.readFileSync(filePath, 'utf8');

			// Convert file content to JSON.
			var profiles = JSON.parse(content);
			profiles.forEach(function(profile){
				loadProfile(profile, ++count);
			});
		});

		// Call run function every 1 second.
		logInfo("Running...");
		mainLoop = setInterval(run, 1);

	});
}

// ---------------------------------------------------------------------------------------

function loadProfile(profile, index) {
	
	enrichProfile(profile);
	registerProfile(profile);

	function enrichProfile(profile){

		profile.index = index;
		profile.run = 0;
		profile.objects = {};
	
		// mode.
		if(!profile.mode) { profile.mode = "singelton"; }
		profile.objects.mode = getAgentObject(profile.mode);
	
		// delay.
		if(!profile.delay) { profile.delay = 0; }
		profile.objects.delay = getAgentObject(profile.delay);

		// actions.
		profile.actions.forEach(function(action){
			enrichAction(action);
		});

		function enrichAction(action){

			action.objects = {};
	
			// from.
			action.objects.from = getAgentObject(action.from);
	
			// to.
			action.objects.to = getAgentObject(action.to);
	
			// value.
			if(!action.val) { action.val = 0; }
			action.objects.val = getAgentObject(action.val);
	
			// gas.
			if(!action.gas) { action.gas = 300000; }	
			action.objects.gas = getAgentObject(action.gas);
	
			// function name.
			if(!action.functionName){ action.functionName = ""; }
			action.objects.functionName = getAgentObject(action.functionName);
	
			// function arguments.
			action.objects.functionArguments = [];
			action.functionArguments.forEach(function(functionArgument){
				var fao = getAgentObject(functionArgument);
				action.objects.functionArguments.push(fao);
			});
	
			// when tx successful actions.
			action.whenTxSuccessful.forEach(function(action){
				enrichAction(action);
			});
	
			// when tx has error actions.
			action.whenTxFailed.forEach(function(action){
				enrichAction(action);
			});
	
			// when tx ready actions.
			action.whenTxReady.forEach(function(action){
				enrichAction(action);
			});
		}

	}
}

// ---------------------------------------------------------------------------------------

function registerProfile(profile) {

	logInfo("Register profile: " + "[" + profile.id + "] " + profile.desc);	
	calculateDelay(profile);
	profiles.push(profile);
	logInfo("Done!");
}


// ---------------------------------------------------------------------------------------

function calculateDelay(profile) {

	var now = Date.now();
	profile.nextRun = parseInt(now) + parseInt(profile.objects.delay.value());
	logInfo("Profile " + profile.id + " next run at " + profile.nextRun);
}

// ---------------------------------------------------------------------------------------

async function run() {
	
	var now = Date.now();

	// Check if loop is to continue running.
	if(now > options.endTime){
		logInfo("Stopping main loop.");
		clearInterval(mainLoop);
		endBlock = await linker.getBlockNumber();	
		logInfo("Start Block: " + startBlock);
		logInfo("End Block: " + endBlock);
		logInfo("Ready!");
		return;
	}

	// Process all registered profiles.
	var profile, runId;
	for(var i = 0; i < profiles.length; i++){
		profile = profiles[i];
		if(profile.nextRun < now){
			runId = uuidv4().split("-")[0];
			profile.run = profile.run + 1;
			profile.actions.forEach(function(action){
				execute(profile, action, runId, 0); // actions are processed async.
			});
			// If profile is marked for cancel (by calculate delay) then remove from
			// profiles list and notify user.
			var mode = profile.objects.mode.value();
			if(mode == "once" || mode == "singleton"){
				logInfo("Unregister profile: " + "[" + profile.id + "] " + profile.desc);
				profiles.splice(i, 1);
			}
			else{
				calculateDelay(profile);
			}
		}
	}
}

// ---------------------------------------------------------------------------------------

async function execute(p, a, runId, depth){

	// Process function and function arguments.
	var args = [];
	a.objects.functionArguments.forEach(function(fao){
		args.push(fao.value());
	});

	// Send transaction to blockchain.
	var moreTxs = [];
	try{

		if(!a.run) { a.run = 0; }
		a.run = a.run + 1;

		var from = a.objects.from.value();
		var to = a.objects.to.value();
		var fn = a.objects.functionName.value();
		var val = a.objects.val.value();
		var gas = a.objects.gas.value();
		
		logInfo(space(depth) + "[" + runId + "]" + "[" + p.run + "." + a.run + "] " 
			+ "id: " + a.id + " function:" + fn + "(" + args + "),value:" + val + ",gas:" + gas + "");
		tx = await linker.sendTransaction(from, to, val, gas, fn, args);
		logInfo(space(depth) + "[" + runId + "]" + "[" + p.run + "." + a.run + "] " 
			/* JSON.stringify(tx.request) */
			+ "id: " + a.id + " "
			+ "from: " + truncate(from,16) + " " 
			+ "to: " + truncate(to,16) + " "  
			+ "tx: " + truncate(tx.hash,16));
		if(a.whenTxSuccessful){ moreTxs = moreTxs.concat(a.whenTxSuccessful); }
		if(a.whenTxReady) { moreTxs = moreTxs.concat(a.whenTxReady); }
	}
	catch(err) { 
		logError(space(depth) + "[" + runId + "] " + "[" + p.run + "." + a.run + "] " 
			+ "id: " + a.id + " "			
			+ "from: " + truncate(from,16) + " " 
			+ "to: " + truncate(to,16) + " "  
			+ "err: " + err);
		if(a.whenTxFailed) { moreTxs = moreTxs.concat(a.whenTxFailed); }
	}

	// Execute any child actions.
	moreTxs.forEach(function(action){
		execute(p, action, runId, ++depth); // actions are processed async.
	});

	// If there are no more TXs, and profile mode is 'singleton' then
	// re-register profile again to be considered again.
	if(p.objects.mode.value() == "singleton" && moreTxs.length == 0){
		registerProfile(p);
	}
}

// ---------------------------------------------------------------------------------------

function truncate(text, size){
	if(text.length <= size) return text;
	else{
		return text.slice(0, size) + ".." /*+ "[truncated]"*/;
	}
}

// ---------------------------------------------------------------------------------------

function space(size){
	return "".padStart(size, " ");
}

// ---------------------------------------------------------------------------------------

function getAgentObject(field){
	if(field && field.hasOwnProperty('type')) {
		var type = field['type'];
		var params = field['params'];
		return AgentObject.create(type + 'AgentObject', params);		
	}
	else {
		// Use static agent object.
		var params = {};
		params['value'] = field;
		return AgentObject.create('StaticAgentObject', params);
	}
}

// ---------------------------------------------------------------------------------------

main();
