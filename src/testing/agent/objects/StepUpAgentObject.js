
// --------------------------------------------------------------------------------------

// Static Agent Object.

// --------------------------------------------------------------------------------------

// Put any imports here...

// --------------------------------------------------------------------------------------

class StepUpAgentObject {
	constructor(options){
		this.startValue = options.startValue;
		this.increaseValue = options.increaseValue;
		this.increaseOp = options.increaseOp;
		this.untilValue = options.untilValue;
		this.nextValue = this.startValue;
	}
}

// --------------------------------------------------------------------------------------

StepUpAgentObject.prototype.value = function(){
	var result = this.nextValue;
	if(result > this.untilValue) result = this.untilValue;
	if(this.increaseOp == "*"){ this.nextValue = result * this.increaseValue; }
	if(this.increaseOp == "+"){ this.nextValue = result + this.increaseValue; }
	return parseInt(result);
}

// --------------------------------------------------------------------------------------

module.exports = StepUpAgentObject;

// --------------------------------------------------------------------------------------
