
// --------------------------------------------------------------------------------------

// Static Agent Object.

// --------------------------------------------------------------------------------------

// Put any imports here...

// --------------------------------------------------------------------------------------

class StepDownAgentObject {
	constructor(options){
		this.startValue = options.startValue;
		this.reduceValue = options.reduceValue;
		this.reduceOp = options.reduceOp;
		this.untilValue = options.untilValue;
		this.nextValue = this.startValue;
	}
}

// --------------------------------------------------------------------------------------

StepDownAgentObject.prototype.value = function(){
	var result = this.nextValue;
	if(result > this.untilValue) result = this.untilValue;
	if(this.reduceOp == "/"){ this.nextValue = result / this.reduceValue; }
	if(this.reduceOp == "-"){ this.nextValue = result - this.reduceValue; }
	return result;
}

// --------------------------------------------------------------------------------------

module.exports = StepDownAgentObject;

// --------------------------------------------------------------------------------------
