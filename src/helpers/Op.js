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

class Op {
	constructor(){
	
		// Text representation of all opcodes.
		this.STOP="STOP";
		this.ADD="ADD";
		this.MUL="MUL";
		this.SUB="SUB";
		this.DIV="DIV";
		this.SDIV="SDIV";
		this.MOD="MOD";
		this.SMOD="SMOD";
		this.ADDMOD="ADDMOD";
		this.MULMOD="MULMOD";
		this.EXP="EXP";
		this.SIGNEXTEND="SIGNEXTEND";
		this.LT="LT";
		this.GT="GT";
		this.SLT="SLT";
		this.SGT="SGT";
		this.EQ="EQ";
		this.ISZERO="ISZERO";
		this.AND="AND";
		this.OR="OR";
		this.XOR="XOR";
		this.NOT="NOT";
		this.BYTE="BYTE";
		this.SHL="SHL";
		this.SHR="SHR";
		this.SAR="SAR";
		this.SHA3="SHA3";
		this.ADDRESS="ADDRESS";
		this.BALANCE="BALANCE";
		this.ORIGIN="ORIGIN";
		this.CALLER="CALLER";
		this.CALLVALUE="CALLVALUE";
		this.CALLDATALOAD="CALLDATALOAD";
		this.CALLDATASIZE="CALLDATASIZE";
		this.CALLDATACOPY="CALLDATACOPY";
		this.CODESIZE="CODESIZE";
		this.CODECOPY="CODECOPY";
		this.GASPRICE="GASPRICE";
		this.EXTCODESIZE="EXTCODESIZE";
		this.EXTCODECOPY="EXTCODECOPY";
		this.RETURNDATASIZE="RETURNDATASIZE";
		this.RETURNDATACOPY="RETURNDATACOPY";
		this.Unused="Unused";
		this.BLOCKHASH="BLOCKHASH";
		this.COINBASE="COINBASE";
		this.TIMESTAMP="TIMESTAMP";
		this.NUMBER="NUMBER";
		this.DIFFICULTY="DIFFICULTY";
		this.GASLIMIT="GASLIMIT";
		this.POP="POP";
		this.MLOAD="MLOAD";
		this.MSTORE="MSTORE";
		this.MSTORE8="MSTORE8";
		this.SLOAD="SLOAD";
		this.SSTORE="SSTORE";
		this.JUMP="JUMP";
		this.JUMPI="JUMPI";
		this.GETPC="GETPC";
		this.MSIZE="MSIZE";
		this.GAS="GAS";
		this.JUMPDEST="JUMPDEST";
		this.PUSH1="PUSH1";
		this.PUSH2="PUSH2";
		this.PUSH3="PUSH3";
		this.PUSH4="PUSH4";
		this.PUSH5="PUSH5";
		this.PUSH6="PUSH6";
		this.PUSH7="PUSH7";
		this.PUSH8="PUSH8";
		this.PUSH9="PUSH9";
		this.PUSH10="PUSH10";
		this.PUSH11="PUSH11";
		this.PUSH12="PUSH12";
		this.PUSH13="PUSH13";
		this.PUSH14="PUSH14";
		this.PUSH15="PUSH15";
		this.PUSH16="PUSH16";
		this.PUSH17="PUSH17";
		this.PUSH18="PUSH18";
		this.PUSH19="PUSH19";
		this.PUSH20="PUSH20";
		this.PUSH21="PUSH21";
		this.PUSH22="PUSH22";
		this.PUSH23="PUSH23";
		this.PUSH24="PUSH24";
		this.PUSH25="PUSH25";
		this.PUSH26="PUSH26";
		this.PUSH27="PUSH27";
		this.PUSH28="PUSH28";
		this.PUSH29="PUSH29";
		this.PUSH30="PUSH30";
		this.PUSH31="PUSH31";
		this.PUSH32="PUSH32";
		this.DUP1="DUP1";
		this.DUP2="DUP2";
		this.DUP3="DUP3";
		this.DUP4="DUP4";
		this.DUP5="DUP5";
		this.DUP6="DUP6";
		this.DUP7="DUP7";
		this.DUP8="DUP8";
		this.DUP9="DUP9";
		this.DUP10="DUP10";
		this.DUP11="DUP11";
		this.DUP12="DUP12";
		this.DUP13="DUP13";
		this.DUP14="DUP14";
		this.DUP15="DUP15";
		this.DUP16="DUP16";
		this.SWAP1="SWAP1";
		this.SWAP2="SWAP2";
		this.SWAP3="SWAP3";
		this.SWAP4="SWAP4";
		this.SWAP5="SWAP5";
		this.SWAP6="SWAP6";
		this.SWAP7="SWAP7";
		this.SWAP8="SWAP8";
		this.SWAP9="SWAP9";
		this.SWAP10="SWAP10";
		this.SWAP11="SWAP11";
		this.SWAP12="SWAP12";
		this.SWAP13="SWAP13";
		this.SWAP14="SWAP14";
		this.SWAP15="SWAP15";
		this.SWAP16="SWAP16";
		this.LOG0="LOG0";
		this.LOG1="LOG1";
		this.LOG2="LOG2";
		this.LOG3="LOG3";
		this.LOG4="LOG4";
		this.JUMPTO="JUMPTO";
		this.JUMPIF="JUMPIF";
		this.JUMPSUB="JUMPSUB";
		this.JUMPSUBV="JUMPSUBV";
		this.BEGINSUB="BEGINSUB";
		this.BEGINDATA="BEGINDATA";
		this.RETURNSUB="RETURNSUB";
		this.PUTLOCAL="PUTLOCAL";
		this.GETLOCAL="GETLOCAL";
		this.SLOADBYTES="SLOADBYTES";
		this.SSTOREBYTES="SSTOREBYTES";
		this.SSIZE="SSIZE";
		this.CREATE="CREATE";
		this.CALL="CALL";
		this.CALLCODE="CALLCODE";
		this.RETURN="RETURN";
		this.DELEGATECALL="DELEGATECALL";
		this.CREATE2="CREATE2";
		this.STATICCALL="STATICCALL";
		this.TXEXECGAS="TXEXECGAS";
		this.REVERT="REVERT";
		this.INVALID="INVALID";
		this.SELFDESTRUCT="SELFDESTRUCT";
		
		// Hex representation of all opcodes.
		this.hex = {
			STOP		: 0x00,
			ADD		: 0x01,
			MUL		: 0x02,
			SUB		: 0x03,
			DIV		: 0x04,
			SDIV		: 0x05,
			MOD		: 0x06,
			SMOD		: 0x07,
			ADDMOD		: 0x08,
			MULMOD		: 0x09,
			EXP		: 0x0a,
			SIGNEXTEND	: 0x0b,
			LT		: 0x10,
			GT		: 0x11,
			SLT		: 0x12,
			SGT		: 0x13,
			EQ		: 0x14,
			ISZERO		: 0x15,
			AND		: 0x16,
			OR		: 0x17,
			XOR		: 0x18,
			NOT		: 0x19,
			BYTE		: 0x1a,
			SHL		: 0x1b,
			SHR		: 0x1c,
			SAR		: 0x1d,
			SHA3		: 0x20,
			ADDRESS		: 0x30,
			BALANCE		: 0x31,
			ORIGIN		: 0x32,
			CALLER		: 0x33,
			CALLVALUE	: 0x34,
			CALLDATALOAD	: 0x35,
			CALLDATASIZE	: 0x36,
			CALLDATACOPY	: 0x37,
			CODESIZE	: 0x38,
			CODECOPY	: 0x39,
			GASPRICE	: 0x3a,
			EXTCODESIZE	: 0x3b,
			EXTCODECOPY	: 0x3c,
			RETURNDATASIZE	: 0x3d,
			RETURNDATACOPY	: 0x3e,
			BLOCKHASH	: 0x40,
			COINBASE	: 0x41,
			TIMESTAMP	: 0x42,
			NUMBER		: 0x43,
			DIFFICULTY	: 0x44,
			GASLIMIT	: 0x45,
			POP		: 0x50,
			MLOAD		: 0x51,
			MSTORE		: 0x52,
			MSTORE8		: 0x53,
			SLOAD		: 0x54,
			SSTORE		: 0x55,
			JUMP		: 0x56,
			JUMPI		: 0x57,
			GETPC		: 0x58,
			MSIZE		: 0x59,
			GAS		: 0x5a,
			JUMPDEST	: 0x5b,
			PUSH1		: 0x60,
			PUSH2		: 0x61,
			PUSH3		: 0x62,
			PUSH4		: 0x63,
			PUSH5		: 0x64,
			PUSH6		: 0x65,
			PUSH7		: 0x66,
			PUSH8		: 0x67,
			PUSH9		: 0x68,
			PUSH10		: 0x69,
			PUSH11		: 0x6a,
			PUSH12		: 0x6b,
			PUSH13		: 0x6c,
			PUSH14		: 0x6d,
			PUSH15		: 0x6e,
			PUSH16		: 0x6f,
			PUSH17		: 0x70,
			PUSH18		: 0x71,
			PUSH19		: 0x72,
			PUSH20		: 0x73,
			PUSH21		: 0x74,
			PUSH22		: 0x75,
			PUSH23		: 0x76,
			PUSH24		: 0x77,
			PUSH25		: 0x78,
			PUSH26		: 0x79,
			PUSH27		: 0x7a,
			PUSH28		: 0x7b,
			PUSH29		: 0x7c,
			PUSH30		: 0x7d,
			PUSH31		: 0x7e,
			PUSH32		: 0x7f,
			DUP1		: 0x80,
			DUP2		: 0x81,
			DUP3		: 0x82,
			DUP4		: 0x83,
			DUP5		: 0x84,
			DUP6		: 0x85,
			DUP7		: 0x86,
			DUP8		: 0x87,
			DUP9		: 0x88,
			DUP10		: 0x89,
			DUP11		: 0x8a,
			DUP12		: 0x8b, 
			DUP13		: 0x8c,
			DUP14		: 0x8d,
			DUP15		: 0x8e,
			DUP16		: 0x8f,
			SWAP1		: 0x90,
			SWAP2		: 0x91, 
			SWAP3		: 0x92,
			SWAP4		: 0x93,
			SWAP5		: 0x94,
			SWAP6		: 0x95,
			SWAP7		: 0x96,
			SWAP8		: 0x97,
			SWAP9		: 0x98,
			SWAP10		: 0x99,
			SWAP11		: 0x9a,
			SWAP12		: 0x9b,
			SWAP13		: 0x9c,
			SWAP14		: 0x9d,
			SWAP15		: 0x9e,
			SWAP16		: 0x9f,
			LOG0		: 0xa0,
			LOG1		: 0xa1,
			LOG2		: 0xa2,
			LOG3		: 0xa3,
			LOG4		: 0xa4,
			JUMPTO		: 0xb0,
			JUMPIF		: 0xb1,
			JUMPSUB		: 0xb2,
			JUMPSUBV	: 0xb4,
			BEGINSUB	: 0xb5,
			BEGINDATA	: 0xb6,
			RETURNSUB	: 0xb8,
			PUTLOCAL	: 0xb9,
			GETLOCAL	: 0xba,
			SLOADBYTES	: 0xe1,
			SSTOREBYTES	: 0xe2,
			SSIZE		: 0xe3,
			CREATE		: 0xf0,
			CALL		: 0xf1,
			CALLCODE	: 0xf2,
			RETURN		: 0xf3,
			DELEGATECALL	: 0xf4,
			CREATE2		: 0xf5,
			STATICCALL	: 0xfa,
			TXEXECGAS	: 0xfc,
			REVERT		: 0xfd,
			INVALID		: 0xfe,
			SELFDESTRUCT	: 0xff,
		};
		// gas consumptions for opcodes,
		this.gas = {
			STOP		: 0,
			ADD		: 3,
			MUL		: 5,
			SUB		: 3,
			DIV		: 5,
			SDIV		: 5,
			MOD		: 5,
			SMOD		: 5,
			ADDMOD		: 8,
			MULMOD		: 8,
			EXP		: undefined,
			SIGNEXTEND	: 5,
			LT		: 3,
			GT		: 3,
			SLT		: 3,
			SGT		: 3,
			EQ		: 3,
			ISZERO		: 3,
			AND		: 3,
			OR		: 3,
			XOR		: 3,
			NOT		: 3,
			BYTE		: 3,
			SHL		: undefined,
			SHR		: undefined,
			SAR		: undefined,
			SHA3		: undefined,
			ADDRESS		: 2,
			BALANCE		: 400,
			ORIGIN		: 2,
			CALLER		: 2,
			CALLVALUE	: 2,
			CALLDATALOAD	: 3,
			CALLDATASIZE	: 2,
			CALLDATACOPY	: undefined,
			CODESIZE	: 2,
			CODECOPY	: undefined,
			GASPRICE	: 2,
			EXTCODESIZE	: 700,
			EXTCODECOPY	: undefined,
			RETURNDATASIZE	: null,
			RETURNDATACOPY	: null,
			BLOCKHASH	: 20,
			COINBASE	: 2,
			TIMESTAMP	: 2,
			NUMBER		: 2,
			DIFFICULTY	: 2,
			GASLIMIT	: 2,
			POP		: 2,
			MLOAD		: 3,
			// MSTORE not always consumes 3 units of gas.
			// https://github.com/ethereum/remix-ide/issues/966
			MSTORE		: undefined,		
			MSTORE8		: undefined,
			SLOAD		: 200,
			SSTORE		: undefined,
			JUMP		: 8,
			JUMPI		: 10,
			GETPC		: 2,
			MSIZE		: 2,
			GAS		: 2,
			JUMPDEST	: 1,
			PUSH1		: 3,
			PUSH2		: 3,
			PUSH3		: 3,
			PUSH4		: 3,
			PUSH5		: 3,
			PUSH6		: 3,
			PUSH7		: 3,
			PUSH8		: 3,
			PUSH9		: 3,
			PUSH10		: 3,
			PUSH11		: 3,
			PUSH12		: 3,
			PUSH13		: 3,
			PUSH14		: 3,
			PUSH15		: 3,
			PUSH16		: 3,
			PUSH17		: 3,
			PUSH18		: 3,
			PUSH19		: 3,
			PUSH20		: 3,
			PUSH21		: 3,
			PUSH22		: 3,
			PUSH23		: 3,
			PUSH24		: 3,
			PUSH25		: 3,
			PUSH26		: 3,
			PUSH27		: 3,
			PUSH28		: 3,
			PUSH29		: 3,
			PUSH30		: 3,
			PUSH31		: 3,
			PUSH32		: 3,
			DUP1		: 3,
			DUP2		: 3,
			DUP3		: 3,
			DUP4		: 3,
			DUP5		: 3,
			DUP6		: 3,
			DUP7		: 3,
			DUP8		: 3,
			DUP9		: 3,
			DUP10		: 3,
			DUP11		: 3,
			DUP12		: 3,
			DUP13		: 3,
			DUP14		: 3,
			DUP15		: 3,
			DUP16		: 3,
			SWAP1		: 3,
			SWAP2		: 3,
			SWAP3		: 3,
			SWAP4		: 3,
			SWAP5		: 3,
			SWAP6		: 3,
			SWAP7		: 3,
			SWAP8		: 3,
			SWAP9		: 3,
			SWAP10		: 3,
			SWAP11		: 3,
			SWAP12		: 3,
			SWAP13		: 3,
			SWAP14		: 3,
			SWAP15		: 3,
			SWAP16		: 3,
			LOG0		: undefined,
			LOG1		: undefined,
			LOG2		: undefined,
			LOG3		: undefined,
			LOG4		: undefined,
			JUMPTO		: null,
			JUMPIF		: null,
			JUMPSUB		: null,
			JUMPSUBV	: null,
			BEGINSUB	: null,
			BEGINDATA	: null,
			RETURNSUB	: null,
			PUTLOCAL	: null,
			GETLOCAL	: null,
			SLOADBYTES	: null,
			SSTOREBYTES	: null,
			SSIZE		: null,
			CREATE		: null,
			CALL		: undefined,
			CALLCODE	: undefined,
			RETURN		: 0,
			DELEGATECALL	: undefined,
			CREATE2		: null,
			STATICCALL	: null,
			TXEXECGAS	: null,
			REVERT		: null,
			INVALID		: undefined,
			SELFDESTRUCT	: undefined,
		};		
	}
}

// --------------------------------------------------------------------------------------

// (00) STOP
Op.prototype.isSTOP = function(text){
	return text == "STOP";
}

// --------------------------------------------------------------------------------------

// (01) ADD
Op.prototype.isADD = function(text){
	return text == "ADD";
}

// --------------------------------------------------------------------------------------

// (02) MUL
Op.prototype.isMUL = function(text){
	return text == "MUL";
}

// --------------------------------------------------------------------------------------

// (03) SUB
Op.prototype.isSUB = function(text){
	return text == "SUB";
}

// --------------------------------------------------------------------------------------

// (04) DIV
Op.prototype.isDIV = function(text){
	return text == "DIV";
}

// --------------------------------------------------------------------------------------

// (05) SDIV
Op.prototype.isSDIV = function(text){
	return text == "SDIV";
}

// --------------------------------------------------------------------------------------

// (06) MOD
Op.prototype.isMOD= function(text){
	return text == "MOD";
}

// --------------------------------------------------------------------------------------

// (07) SMOD
Op.prototype.isSMOD = function(text){
	return text == "SMOD";
}

// --------------------------------------------------------------------------------------

// (08) ADDMOD
Op.prototype.isADDMOD= function(text){
	return text == "ADDMOD";
}

// --------------------------------------------------------------------------------------

// (09) MULMOD
Op.prototype.isMULMOD= function(text){
	return text == "MULMOD";
}

// --------------------------------------------------------------------------------------

// (0A) EXP
Op.prototype.isEXP = function(text){
	return text == "EXP";
}

// --------------------------------------------------------------------------------------

// (0B) SIGNEXTEND
Op.prototype.isSIGNEXTEND = function(text){
	return text == "SIGNEXTEND";
}

// --------------------------------------------------------------------------------------

// (10) LT
Op.prototype.isLT = function(text){
	return text == "LT";
}

// --------------------------------------------------------------------------------------

// (11) GT
Op.prototype.isGT = function(text){
	return text == "GT";
}

// --------------------------------------------------------------------------------------

// (12) SLT
Op.prototype.isSLT = function(text){
	return text == "SLT";
}

// --------------------------------------------------------------------------------------

// (13) SGT
Op.prototype.isSGT = function(text){
	return text == "SGT";
}

// --------------------------------------------------------------------------------------

// (14) EQ
Op.prototype.isEQ = function(text){
	return text == "EQ";
}

// --------------------------------------------------------------------------------------

// (15) ISZERO
Op.prototype.isISZERO = function(text){
	return text == "ISZERO";
}

// --------------------------------------------------------------------------------------

// (16) AND
Op.prototype.isAND = function(text){
	return text == "AND";
}

// --------------------------------------------------------------------------------------

// (17) OR
Op.prototype.isOR = function(text){
	return text == "OR";
}

// --------------------------------------------------------------------------------------

// (18) XOR
Op.prototype.isXOR = function(text){
	return text == "XOR";
}

// --------------------------------------------------------------------------------------

// (19) NOT
Op.prototype.isNOT = function(text){
	return text == "NOT";
}

// --------------------------------------------------------------------------------------

// (1A) BYTE
Op.prototype.isBYTE = function(text){
	return text == "BYTE";
}

// --------------------------------------------------------------------------------------

// (1B) SHL
Op.prototype.isSHL = function(text){
	return text == "SHL";
}

// --------------------------------------------------------------------------------------

// (1C) SHR
Op.prototype.isSHR = function(text){
	return text == "SHR";
}

// --------------------------------------------------------------------------------------

// (1D) SAR
Op.prototype.isSAR = function(text){
	return text == "SAR";
}

// --------------------------------------------------------------------------------------

// (20) SHA3
Op.prototype.isSHA3 = function(text){
	return text == "SHA3";
}

// --------------------------------------------------------------------------------------

// (30) ADDRESS
Op.prototype.isADDRESS = function(text){
	return text == "ADDRESS";
}

// --------------------------------------------------------------------------------------

// (31) BALANCE
Op.prototype.isBALANCE = function(text){
	return text == "BALANCE";
}

// --------------------------------------------------------------------------------------

// (32) ORIGIN
Op.prototype.isORIGIN = function(text){
	return text == "ORIGIN";
}

// --------------------------------------------------------------------------------------

// (33) CALLER
Op.prototype.isCALLER = function(text){
	return text == "CALLER";
}

// --------------------------------------------------------------------------------------

// (34) CALLVALUE
Op.prototype.isCALLVALUE = function(text){
	return text == "CALLVALUE";
}

// --------------------------------------------------------------------------------------

// (35) CALLDATALOAD
Op.prototype.isCALLDATALOAD = function(text){
	return text == "CALLDATALOAD";
}

// --------------------------------------------------------------------------------------

// (36) CALLDATASIZE
Op.prototype.isCALLDATASIZE = function(text){
	return text == "CALLDATASIZE";
}

// --------------------------------------------------------------------------------------

// (37) CALLDATACOPY
Op.prototype.isCALLDATACOPY = function(text){
	return text == "CALLDATACOPY";
}

// --------------------------------------------------------------------------------------

// (38) CODESIZE
Op.prototype.isCODESIZE = function(text){
	return text == "CODESIZE";
}

// --------------------------------------------------------------------------------------

// (39) CODECOPY
Op.prototype.isCODECOPY = function(text){
	return text == "CODECOPY";
}

// --------------------------------------------------------------------------------------

// (3A) GASPRICE
Op.prototype.isGASPRICE = function(text){
	return text == "GASPRICE";
}

// --------------------------------------------------------------------------------------

// (3B) EXTCODESIZE
Op.prototype.isEXTCODESIZE = function(text){
	return text == "EXTCODESIZE";
}

// --------------------------------------------------------------------------------------

// (3C) EXTCODECOPY
Op.prototype.isEXTCODECOPY = function(text){
	return text == "EXTCODECOPY";
}

// --------------------------------------------------------------------------------------

// (3D) RETURNDATASIZE
Op.prototype.isRETURNDATASIZE = function(text){
	return text == "RETURNDATASIZE";
}

// --------------------------------------------------------------------------------------

// (3E) RETURNDATACOPY
Op.prototype.isRETURNDATACOPY = function(text){
	return text == "RETURNDATACOPY";
}

// --------------------------------------------------------------------------------------

// (3F) EXTCODEHASH
Op.prototype.isEXTCODEHASH = function(text){
	return text == "EXTCODEHASH";
}

// --------------------------------------------------------------------------------------

// (40) BLOCKHASH
Op.prototype.isBLOCKHASH = function(text){
	return text == "BLOCKHASH";
}

// --------------------------------------------------------------------------------------

// (41) COINBASE
Op.prototype.isCOINBASE = function(text){
	return text == "COINBASE";
}

// --------------------------------------------------------------------------------------

// (42) TIMESTAMP
Op.prototype.isTIMESTAMP = function(text){
	return text == "TIMESTAMP";
}

// --------------------------------------------------------------------------------------

// (43) NUMBER 	
Op.prototype.isNUMBER = function(text){
	return text == "NUMBER";
}

// --------------------------------------------------------------------------------------

// (44) DIFFICULTY
Op.prototype.isDIFFICULTY = function(text){
	return text == "DIFFICULTY";
}

// --------------------------------------------------------------------------------------

// (45) GASLIMIT
Op.prototype.isGASLIMIT = function(text){
	return text == "GASLIMIT";
}

// --------------------------------------------------------------------------------------

// (50) POP
Op.prototype.isPOP = function(text){
	return text == "POP";
}

// --------------------------------------------------------------------------------------

// (51) MLOAD
Op.prototype.isMLOAD = function(text){
	return text == "MLOAD";
}

// --------------------------------------------------------------------------------------

// (52) MSTORE
Op.prototype.isMSTORE = function(text){
	return text == "MSTORE";
}

// --------------------------------------------------------------------------------------

// (53) MSTORE8
Op.prototype.isMSTORE8 = function(text){
	return text == "MSTORE8";
}

// --------------------------------------------------------------------------------------

// (54) SLOAD
Op.prototype.isSLOAD = function(text){
	return text == "SLOAD";
}

// --------------------------------------------------------------------------------------

// (55) SSTORE
Op.prototype.isSSTORE = function(text){
	return text == "SSTORE";
}

// --------------------------------------------------------------------------------------

// (56) JUMP
Op.prototype.isJUMP = function(text){
	return text == "JUMP";
}

// --------------------------------------------------------------------------------------

// (57) JUMPI
Op.prototype.isJUMPI = function(text){
	return text == "JUMPI";
}

// --------------------------------------------------------------------------------------

// (58) PC
Op.prototype.isPC = function(text){
	return text == "PC";
}

// --------------------------------------------------------------------------------------

// (59) MSIZE
Op.prototype.isMSIZE = function(text){
	return text == "MSIZE";
}

// --------------------------------------------------------------------------------------

// (5A) GAS
Op.prototype.isGAS = function(text){
	return text == "GAS";
}

// --------------------------------------------------------------------------------------

// (5B) JUMPDEST
Op.prototype.isJUMPDEST = function(text){
	return text == "JUMPDEST";
}

// --------------------------------------------------------------------------------------

// (60) PUSH1, ... (7F) PUSH32
Op.prototype.isPUSH_ = function(text){
	return text.substring(0,4) === "PUSH";
}

// --------------------------------------------------------------------------------------

// (80) DUP1, ... (8F) DUP16
Op.prototype.isDUP_ = function(text){
	return text.substring(0,3) === "DUP";
}

// --------------------------------------------------------------------------------------

// (90) SWAP1, ... (9F) SWAP16
Op.prototype.isSWAP_ = function(text){
	return text.substring(0,4) === "SWAP";
}

// --------------------------------------------------------------------------------------

// (A0) LOG0, ... (A4) LOG4
Op.prototype.isLOG_ = function(text){
	return text.substring(0,3) === "LOG";
}

// --------------------------------------------------------------------------------------

// (F0) CREATE
Op.prototype.isCREATE = function(text){
	return text == "CREATE";
}

// --------------------------------------------------------------------------------------

// (F1) CALL
Op.prototype.isCALL= function(text){
	return text == "CALL";
}

// --------------------------------------------------------------------------------------

// (F2) CALLCODE
Op.prototype.isCALLCODE = function(text){
	return text == "CALLCODE";
}

// --------------------------------------------------------------------------------------

// (F3) RETURN
Op.prototype.isRETURN = function(text){
	return text == "RETURN";
}

// --------------------------------------------------------------------------------------

// (F4) DELEGATECALL
Op.prototype.isDELEGATECALL = function(text){
	return text == "DELEGATECALL";
}

// --------------------------------------------------------------------------------------

// (F5) CREATE2
Op.prototype.isCREATE2 = function(text){
	return text == "CREATE2";
}

// --------------------------------------------------------------------------------------

// (FA) STATICCALL
Op.prototype.isSTATICCALL = function(text){
	return text == "STATICCALL";
}

// --------------------------------------------------------------------------------------

// (FD) REVERT
Op.prototype.isREVERT = function(text){
	return text == "REVERT";
}

// --------------------------------------------------------------------------------------

// (FF) SELFDESTRUCT
Op.prototype.isSELFDESTRUCT = function(text){
	return text == "SELFDESTRUCT";
}

// --------------------------------------------------------------------------------------

module.exports = Op;

// --------------------------------------------------------------------------------------