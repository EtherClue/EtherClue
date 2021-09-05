'use strict';
class AgentObject{}
AgentObject.prototype.create = function(what, options){
	var Type; 
	// Load from internal collection of libraries.
	try{ Type = require("./" + what); } catch(err){ console.log(err); }
	// Load from external collection of libraries.
	if(!Type){ 
		try{
			Type = require(what); 
		} 
		catch(err){
			console.log("Package '" + what + "' not found! " + err); 
		}
	}
	// Return what found.
	return new Type(options);
}
module.exports = new AgentObject();