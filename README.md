# Introduction

EtherClue (v2.1.1) is a prototype post-factum Smart Contract Digital Forensics tool. Given knowledge of a vulnerability class in a contract-account, EtherClue performs a search within the transaction history of the contract-account and identifies the transactions in which such a vulnerability class has been exploited. This tool works by looking for Indicators of Compromise (IoC) left behind by the exploit of a vulnerability class. It can work either at EVM level where IoC patterns that generalize over a vulnerability class can detect IoCs from the re-constructed transaction traces, or at the Block level where IoC patterns specific for a smart-contract can be applied on the readily available blockchain states. 

# Installation

Navigate to solution src directory:  

```
cd src  
cd application  
```

Install the following node packages:    

```
npm install big-integer  
npm install split-string  
npm install hashmap  
npm install keccak256  
npm install web3  
npm install web3-eth-debug  
npm install etherscan-api  
npm install level  
npm install node-file-cache  
npm install command-line-args  
npm install command-line-usage  
```

Import the local modules:  

```
.\Update.sh
```

Run the following command for help information:  

```
node App.js --help
```

# IoC Detection

Run solution using node js.  

```
node App.js <arguments>
```

Following is an example command to run EtherClue for the BECToken contract account to detect IoCs at the EVM Level.  Please note that web3 provider is not set (<?>). This needs to point to an archive node.

```
node App -t "5482796-5488697[blockchair+fs][web3][evm[geth]]" 
         -p address=0xc5d105e63711398af9bbff092d4b6769c82f793d 
         -f blockchair[from=5482796,to=5488697,fs=["batchTransfer(address[],uint256)"]] 
         -e web3[provider=<?>] 
         -d evm[pattern=GethOverflowIoCDetector]
```

See wiki pages for more information.

# Results

See: https://github.com/EtherClue/Results

# License

BSD 3-Clause “New” or “Revised” License  
See: https://choosealicense.com/licenses/bsd-3-clause/
