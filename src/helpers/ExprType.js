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

const bigInt 	= require("big-integer");

// --------------------------------------------------------------------------------------

/**
 * Helper class representing the expression types supported by the solidity programming
 * language, i.e. - 
 * 
 * 	- Uint256, Uint128, Uint64, Uint32, Uint16, Uint8
 * 	- Int256, Int128, Int64, Int32, Int16, Int8
 * 
 * Also provides helper functions that return the min/max value of each type and which
 * type is signed / unsigned.
 *  
 */
class ExprType {
	constructor(){
	
		this.Uint256	= "uint256";
		this.Uint128	= "uint128";
		this.Uint64		= "uint64";
		this.Uint32		= "uint32";
		this.Uint16		= "uint16";
		this.Uint8		= "uint8";

		this.Int256		= "int256";
		this.Int128		= "int128";
		this.Int64		= "int64";
		this.Int32		= "int32";
		this.Int16		= "int16";
		this.Int8		= "int8";

		this.Int256Min	= ((bigInt(2).pow(256)).divide(2)).times(-1);
		this.Int128Min	= ((bigInt(2).pow(128)).divide(2)).times(-1);
		this.Int64Min	= ((bigInt(2).pow(64)).divide(2)).times(-1);
		this.Int32Min	= ((bigInt(2).pow(32)).divide(2)).times(-1);
		this.Int16Min	= ((bigInt(2).pow(16)).divide(2)).times(-1);
		this.Int8Min	= ((bigInt(2).pow(8)).divide(2)).times(-1);

		this.Int256Max	= ((bigInt(2).pow(256)).divide(2)).minus(1);
		this.Int128Max	= ((bigInt(2).pow(128)).divide(2)).minus(1);
		this.Int64Max	= ((bigInt(2).pow(64)).divide(2)).minus(1);
		this.Int32Max	= ((bigInt(2).pow(32)).divide(2)).minus(1);
		this.Int16Max	= ((bigInt(2).pow(16)).divide(2)).minus(1);
		this.Int8Max	= ((bigInt(2).pow(8)).divide(2)).minus(1);

		this.Uint256Min	= 0;
		this.Uint128Min	= 0;
		this.Uint64Min	= 0; 
		this.Uint32Min	= 0; 
		this.Uint16Min	= 0; 
		this.Uint8Min	= 0; 

		this.Uint256Max	= (bigInt(2).pow(256)).minus(1);
		this.Uint128Max	= (bigInt(2).pow(128)).minus(1);
		this.Uint64Max	= (bigInt(2).pow(64)).minus(1);
		this.Uint32Max	= (bigInt(2).pow(32)).minus(1);
		this.Uint16Max	= (bigInt(2).pow(16)).minus(1);
		this.Uint8Max	= (bigInt(2).pow(8)).minus(1);
	}
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isSigned = function(exprType){
	return exprType.substring(0,1) === "i";
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isNotSigned = function(exprType){
	!this.isSigned(exprType);
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isUint256 = function(exprType){
	return exprType === this.Uint256;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isUint128 = function(exprType){
	return exprType === this.Uint128;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isUint64 = function(exprType){
	return exprType === this.Uint264;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isUint32 = function(exprType){
	return exprType === this.Uint32;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isUint16 = function(exprType){
	return exprType === this.Uint16;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isUint8 = function(exprType){
	return exprType === this.Uint8;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isInt256 = function(exprType){
	return exprType === this.Int256;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isInt128= function(exprType){
	return exprType === this.Int128;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isInt64 = function(exprType){
	return exprType === this.Int64;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isInt32 = function(exprType){
	return exprType === this.Int32;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isInt16 = function(exprType){
	return exprType === this.Int16;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.isInt8 = function(exprType){
	return exprType === this.Int8;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.max = function(exprType){
	if(this.isInt256(exprType)) 		{ return this.Int256Max; 	}
	else if(this.isInt128(exprType)) 	{ return this.Int128Max; 	}
	else if(this.isInt64(exprType)) 	{ return this.Int64Max; 	}
	else if(this.isInt32(exprType)) 	{ return this.Int32Max; 	}
	else if(this.isInt16(exprType)) 	{ return this.Int16Max; 	}
	else if(this.isInt8(exprType)) 		{ return this.Int8Max; 		}
	else if(this.isUint256(exprType)) 	{ return this.Uint256Max; 	}
	else if(this.isUint128(exprType)) 	{ return this.Uint128Max; 	}
	else if(this.isUint64(exprType)) 	{ return this.Uint64Max;	}
	else if(this.isUint32(exprType)) 	{ return this.Uint32Max;	}
	else if(this.isUint16(exprType)) 	{ return this.Uint16Max; 	}
	else if(this.isUint8(exprType)) 	{ return this.Uint8Max; 	}
	return 0;
}

// --------------------------------------------------------------------------------------

ExprType.prototype.min = function(exprType){
	if(this.isInt256(exprType)) 		{ return this.Int256Min;	}
	else if(this.isInt128(exprType)) 	{ return this.Int128Min;	}
	else if(this.isInt64(exprType)) 	{ return this.Int64Min;		}
	else if(this.isInt32(exprType)) 	{ return this.Int32Min;		}
	else if(this.isInt16(exprType)) 	{ return this.Int16Min;		}
	else if(this.isInt8(exprType)) 		{ return this.Int8Min;		}
	/* Min for unsigned types always zero. */
	return 0;
}

// --------------------------------------------------------------------------------------

module.exports = ExprType;

// --------------------------------------------------------------------------------------