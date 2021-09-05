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

const commandLineArgs 	= require("command-line-args");
const commandLineUsage  = require("command-line-usage");
const splitString 		= require('split-string');

const level 			= require('level');

const FiltersManager	= require("etherclue-filters");
const ExplorersManager	= require("etherclue-explorers");
const DetectorsManager	= require("etherclue-detectors");

// ---------------------------------------------------------------------------------------

// Define supported options for the evm-level-ioc-d solution.
const optionDefinitons = [

	{ name: "help",	alias: 'h', type: Boolean, description: "Display this guide." },
	{ name: "detector",	alias: 'd', type: String, description: "IoC Detector." },
	{ name: "explorer",	alias: 'e', type: String, description: "Blockchain Explorer." },
	{ name: "filter", alias: 'f', type: String, description: "Transaction Filter." },
	{ name: "output", alias: 'o', type: String, description: "Output File." },
	{ name: "parameters", alias: 'p', type: String, multiple: true, 
			description: "Shared Parameters." },
	{ name: "title", alias: 't', type: String, description: "Title." },
	{ name: "cache", alias: 'c', type: String, description: "Enable cache." },
];

// ---------------------------------------------------------------------------------------

// Used to show help information to the user (in case -h or --help option is selected).
const usage = commandLineUsage([
	{
		header: 'EtherClue (v2.1.1)',
		content: 'Ethereum Indicator of Compromose Detection.' 
	},
	{
		header: 'Options',
		optionList: optionDefinitons
	},
	{
		content: 'Project home: {underline https://github.com/EtherClue}'
	}	
]);

// ---------------------------------------------------------------------------------------

// Retrieve options passed as command line arguments.
const options = commandLineArgs(optionDefinitons);

// Show help information if -h or --help option is selected.
if(options.help){ console.log(usage); return; }

// ---------------------------------------------------------------------------------------

// Set default values.

if(!options.output) 	{ options.output = null; 		}
if(!options.parameters) { options.parameters = []; 		}
if(!options.filter) 	{ options.filter = "dummy[]"; 	}
if(!options.explorer) 	{ options.explorer = "dummy[]"; }
if(!options.detector) 	{ options.detector = "dummy[]"; }

// ---------------------------------------------------------------------------------------

// Initialise cache database if option is enabled.
if(options.cache){
	options.cacheDB = level(
		options.cache,
		{keyEncoding:'text', valueEncoding:'json'}
	);
}

// ---------------------------------------------------------------------------------------

// Store statistics.
var statistics = {};

// ---------------------------------------------------------------------------------------

/**
 * Helper function to provide the Date object with a function that returns the current
 * time in the wanted format.
 * 
 * @returns Current time in the format HH:MM:SS
 */
Date.prototype.timeNow = function () {
	return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

// ---------------------------------------------------------------------------------------

/**
 * Class passed to other modules so thet ca log details from one location.
 */
class Logger{
	constructor(options){
		this.output = options.output;
	}
}

/**
 * Use to log info message.
 * @param text The text to printed as an information message.
 */
Logger.prototype.logInfo = async function(text){
	var date = new Date();
	var text = "[info][" + date.timeNow() + "] " + text;
	console.log(text);
	this.write(text);
}

/**
 * Use to log error message.
 * @param text The text to be printed as an error message. 
 */
Logger.prototype.logError = async function(text){
	var date = new Date();
	var text = "[error][" + date.timeNow() + "] " + text;
	console.log(text);
	this.write(text);
}

/**
 * Write log entry to file.
 * @param text The text to be written to output file. 
 */
 Logger.prototype.write = async function(text){
	 // TODO.
 }

// Create single instance of the Logger class to be shared between all modules.
var logger = new Logger(options);

// ---------------------------------------------------------------------------------------

// Initialise filter.

// Extract filter id and arguments from explorer command line argument.
var filterId, filterArgs = [], filterArgsStr;
fi = options.filter.indexOf('[');
filterId = options.filter.slice(0, fi);
filterArgsStr = options.filter.slice(fi + 1, options.filter.length - 1);
var args = splitString(filterArgsStr, { separator: ',', brackets: true });
args.forEach(function(p){
	p = p.split("=");
	filterArgs[p[0]]=p[1];
});

// Add additional parameters.
Object.getOwnPropertyNames(options.parameters).forEach(function (key, idx, array) {
	if(idx == options.parameters.length){return;}
	var p = options.parameters[key].split("=");
	filterArgs[p[0]]=p[1];
});
filterArgs['logger'] = logger;

// Initialise filter.
var filter =  FiltersManager.create(filterId, filterArgs);

// ---------------------------------------------------------------------------------------

// Initialise explorer.

// Extract explorer id and arguments from explorer command line argument.
var explorerId, explorerArgs, l = options.explorer.split("[");
explorerId = l[0]; explorerArgs = {};
var args = l[1].slice(0, l[1].length-1).split(",");
args.forEach(function(p){
	p = p.split("=");
	explorerArgs[p[0]]=p[1];
});

// Add additional parameters.
Object.getOwnPropertyNames(options.parameters).forEach(function (key, idx, array) {
	if(idx == options.parameters.length){return;}
	var p = options.parameters[key].split("=");
	explorerArgs[p[0]]=p[1];
});
explorerArgs['logger'] = logger;

// Initialise explorer.
var explorer =  ExplorersManager.create(explorerId, explorerArgs);

// ---------------------------------------------------------------------------------------

// Initialise detector.

// Extract filter id and arguments from explorer command line argument.
var detectorId, detectorArgs, l = options.detector.split("[");
detectorId = l[0]; detectorArgs = {};
var args = l[1].slice(0, l[1].length-1).split(",");
args.forEach(function(p){
	p = p.split("=");
	detectorArgs[p[0]]=p[1];
});

// Add additional parameters.
Object.getOwnPropertyNames(options.parameters).forEach(function (key, idx, array) {
	if(idx == options.parameters.length){return;}
	var p = options.parameters[key].split("=");
	detectorArgs[p[0]]=p[1];
});  
detectorArgs['logger'] = logger;
detectorArgs['explorer'] = explorer;
detectorArgs['cacheDB'] = options.cacheDB;

// Initialise explorer.
var detector =  DetectorsManager.create(detectorId, detectorArgs);

// ---------------------------------------------------------------------------------------

/**
 * Start main application logic.
 */
async function main(){

	// Start.
	logger.logInfo("EtherClue v2.1.1");
	logger.logInfo("Title: " + options.title);

	// Log if cache enabled or not.
	if(options.cache){ logger.logInfo("Cache enabled (" + options.cache + ")"); }
	else { logger.logInfo("Cache disabled."); }
	
	// Retrieve transactions to be processed.
	logger.logInfo("Retrieving transactions to be processed...");
	timeA = new Date();
	var txs = await filter.txList();
	timeB = new Date();
	statistics["filter"] = await timeDiff(timeB, timeA);
	logger.logInfo("Loaded " + txs.length + " transactions " + 
			"in " + statistics["filter"] + "ms.");

	// Exit if not transactions have been loaded.
	if(txs.length == 0){ ready(); return; }

	// Next pass the ball to the ioc detector.
	logger.logInfo("Searching for IoCs in retrieved transactions...");
	timeA = new Date();
	var iocs = await detector.processTXs(txs);
	timeB = new Date();
	statistics["detector"] = await timeDiff(timeB, timeA);
	logger.logInfo("Detector found " + iocs + " IoCs " +
			"in " + statistics["detector"] + "ms.");
}
// ---------------------------------------------------------------------------------------

/**
 * Returns time difference (in milliseconds) between two given Date objects.
 * @param timeA The oldest Date.
 * @param timeB The newest Date.
 * @returns The time difference (in milliseconds) between the two Date objects.
 */
async function timeDiff(timeA, timeB){
	//var r =  Math.ceil((timeB - timeA) / 1000); // seconds.
	return Math.abs(timeB - timeA); // milliseconds.
}
// ---------------------------------------------------------------------------------------

/**
 * Print "Ready!" on the console. Can be expanded to also print other details if need be,
 * just before application will exit.
 */
async function ready(){

	// Print some statistcs.

	// No further processing beyond this point.
	logger.logInfo("Ready!");
}

// ---------------------------------------------------------------------------------------

// Start.
main();

// ---------------------------------------------------------------------------------------
