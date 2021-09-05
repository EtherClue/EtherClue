
// --------------------------------------------------------------------------------------

// Static Agent Object.

// --------------------------------------------------------------------------------------

// Put any imports here...

// --------------------------------------------------------------------------------------

class StepDownAgentObject {
	constructor(options){
		this.min = options.min;
		this.max = options.max;
	}
}

// --------------------------------------------------------------------------------------

StepDownAgentObject.prototype.value = function(){
	
	return Math.floor((Math.random() * this.max) + this.min);
}

// --------------------------------------------------------------------------------------

module.exports = StepDownAgentObject;

// --------------------------------------------------------------------------------------