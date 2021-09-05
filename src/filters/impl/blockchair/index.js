
const fetch 		= require('node-fetch');
const keccak256 	= require('keccak256');
const splitString 	= require('split-string');

// ---------------------------------------------------------------------------------------

const delay = ms => new Promise(res => setTimeout(res, ms));

// ---------------------------------------------------------------------------------------

/**
 * Default constructor.
 */
class BlockchairFilter {
	constructor(options){

		// Application level logger.
		this.logger = options.logger;

		// Address of contract account for which to load the transactions.
		this.address = options.address;

		// Block from which to start the transaction search.
		this.from = parseInt(options.from);

		// Block at which to end the transaction search.
		this.to = parseInt(options.to);

		// Function select applied on transactions (i.e. - this does not
		// filter out internal message calls that do not call this function.)
		this.fs = options.fs;

		this.pageCount = 10000;
		this.retryCount = parseInt(options.retryCount);
		this.retryDelay = parseInt(options.retryDelay);
		this.blockCount = parseInt(options.blockCount);

		if(!this.retryCount){ this.retryCount = 15; }
		if(!this.retryDelay){ this.retryDelay = 500; }
		if(!this.blockCount){ this.blockCount = 100000; }

		this.baseUrl = "https://api.blockchair.com/ethereum";
	}
}

// ---------------------------------------------------------------------------------------

/**
 * 
 */
BlockchairFilter.prototype.txList = async function(){

	var mc = await this.fetchDetails(this.from, this.to, 'calls');
	this.logger.logInfo("Loaded " + mc.length + " message calls.");

	if(mc.length == 0) { return [] }
	
	this.logger.logInfo("Flattening message calls to unique transactions...");
	var txs = await this.flattenTxList(mc);
	this.logger.logInfo("Flattened to " + txs.length + " unique transactions.");
	
	if(this.fs){
		this.logger.logInfo("Apply function select logic...");
		var many = txs.length;
		txs = await this.applyFunctionSelect(txs);
		this.logger.logInfo("Filtered out " + (many - txs.length) + " transactions.");
		this.logger.logInfo("There are " + txs.length + " transactions left.");
	}

	// Return transactions.
	return txs;
}
// ---------------------------------------------------------------------------------------

BlockchairFilter.prototype.toString = async function(){
	return "BlockchairFilter";
}

// ---------------------------------------------------------------------------------------

BlockchairFilter.prototype.fetchDetails = async function(fromBlock, toBlock, calltype){

	var _self = this;

	//  Сurrent limitations are:
	//		- 30 requests per minute and 1800 per hour.
	// 		- limit cannot be more than 100.
	//		- offset cannot be more than 10,000.
	var mc = [];
	var url = this.baseUrl + "/"+ calltype + "?q=block_id(" + fromBlock + ".." + toBlock + 
			"),recipient(" + this.address.toLowerCase() + ")";
	var limit = 100;
	var totalRows = -1;
	var lastBlockNumber = toBlock;
	var lastOffsetBlock = toBlock;
	var lastRowNumber = 0;
	var lastBlockRows = 0;
	var offset = 0;
	var maxoffset = 9000;
	
	do{
		this.logger.logInfo("Fetching " + calltype + " from block " + lastOffsetBlock + 
				" at offset " + offset + " backwards...");
		var request = url + "&limit=" + limit + "&offset=" + offset;
		//console.log(request);
		var data = await fetch(request);
		var json = await data.json();
		if(json){
			if(json.data){
				// console.log(json.context);
				if(totalRows == -1){
					totalRows = json.context.total_rows;
				}
				_self.logger.logInfo("Received " + json.context.rows + " rows. " + 
						((totalRows - lastRowNumber) - json.context.rows) + 
						" left to process from " + totalRows + " rows.");
				json.data.forEach(function(tx){
					mc.push(
						{
							blockNumber : tx['block_id'],
							hash : (calltype == 'calls' ? tx['transaction_hash'] : tx['hash']),
							'blockchair-data' : tx
						}
					);
					offset = offset + 1;
					if(lastBlockNumber != tx['block_id']){
						lastBlockRows = 0;
					}
					lastBlockRows = lastBlockRows + 1;
					lastRowNumber = lastRowNumber + 1;
					lastBlockNumber = tx['block_id'];
				});
				if(offset > maxoffset){
					offset = lastBlockRows;
					lastOffsetBlock = lastBlockNumber;
					url = this.baseUrl + "/" + calltype + "?q=block_id(" + fromBlock + ".." + 
							lastOffsetBlock + "),recipient(" + 
							this.address.toLowerCase() + ")";
				}
			}
			else if(json.context && json.context.error){
				if(json.context.error.startsWith("You're sending too many requests.")){
					var waitTime = 60;
					this.logger.logInfo(
							"Keeping within the bounds of API limit. Waiting " + 
							waitTime + "s...");
					await delay(waitTime * 1000);
				}
				else{
					throw json.context.error;
				}
			}
		}
	}
	while(lastRowNumber < totalRows);
	
	return mc;
}

// ---------------------------------------------------------------------------------------

/**
 * The same transaction can be linked to one or more internal transaction call. This 
 * function will go through the provided txlist and remove any duplicate transactions
 * keeping only the first tx reference encountered.
 *
 * @param emc TXs loaded as external message calls.
 * @param imc TXs loaded as internal message calls.
 * @return Array containing only unique transactions.
 */
BlockchairFilter.prototype.flattenTxList = async function(mc){

	var _self = this;

	var txList = [];

	// message calls needs to be grouped.
	if(mc){
		for(var i = 0; i < mc.length; i++){
			var txInt = mc[i];
			if(txInt.blockNumber >= _self.from && txInt.blockNumber <= _self.to){
				var found = false;
				txList.forEach(function (tx){
					if(tx.hash == txInt.hash){
						found = true;
						return;	// stop loop.
					}
				});
				if(!found){
					txList.push(
						{
							blockNumber : txInt.blockNumber,
							hash : txInt.hash,
							'blockchair-data' : txInt['blockchair-data']
						}
					);
				}
			}
		}
	}
	// Sort transactions within the block.
	txList.sort(function(a, b){
		if(parseInt(a.blockNumber) > parseInt(b.blockNumber)){ return 1; }
		else if(parseInt(a.blockNumber) < parseInt(b.blockNumber)){ return -1; }
		else{
			if(parseInt(a.transactionIndex) > parseInt(b.transactionIndex)){ return 1; }
			else{ return -1;}
		}
	});

	return txList;
}

// ---------------------------------------------------------------------------------------

/**
 * 
 * @param { } txs 
 */
BlockchairFilter.prototype.applyFunctionSelect = async function(txs){

	var _self = this;

	// For function selection we need to go through all transactions and if transaction
	// 'to' address is of the target contract account then check the function called.
	// Note: this will increase the hits to the blockchair api.

	// Get keccak256 representation for the selected functions.
	var fsString = this.fs.slice(1,this.fs.length-1);
	var fsFunctions = splitString(fsString, { separator: ',', brackets: true })
	var fsSignatures = [];
	fsFunctions.forEach(function(f){
		var functionKeccak256 = keccak256(f).toString("hex").slice(0,8);
		_self.logger.logInfo("(keccak256) " + f + " = " + functionKeccak256);
		fsSignatures.push(functionKeccak256);
	});

	// Retrieve all known external message calls (transactions).
	var emc = await this.fetchDetails(this.from, this.to, 'transactions');

	// Apply filter. If a given transaction is an emc to the contract then we check
	// the function that has been called; otherwise we re-add to the filter as we cannot
	// judge if an internal message call part of that transaction has called. 
	var filter = [];
	for(var a = 0; a < txs.length; a++){
		var txA = txs[a]; add = true;
		for(var b = 0; b < emc.length; b++){
			var txB = emc[b];
			if(txA.hash == txB.hash) {
				var found = false;
				fsSignatures.forEach(function(fsSignature){
					if(fsSignature === txA['blockchair-data']['input_hex'].slice(0, 8)){
						found = true;
						return;
					}
				});
				add = found;
			}
		}
		if(add){ filter.push(txA); }
	}

	// Note: this code could be improved further. Blockchair API has an input hex linked
	// to each call. If this is per call then we can avoid retrieving the transactions
	// for the contract for the input compare and potentially be able to filter both
	// external and internal message calls.

	return filter;
}

// ---------------------------------------------------------------------------------------

module.exports = BlockchairFilter;

// ---------------------------------------------------------------------------------------
