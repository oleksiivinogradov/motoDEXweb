// load network.js to get network/chain id
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./network.js" }));
// load web3modal to connect to wallet
//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/lib/web3modal.js" }));
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/web3modal@1.9.4/dist/index.js" }));

// load web3js to create transactions
//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/lib/web3.min.js" }));
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/web3@1.2.11/dist/web3.min.js" }));

// uncomment to enable torus wallet
// document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/@toruslabs/torus-embed" }));
// uncomment to enable walletconnect
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/@walletconnect/web3-provider@1.7.1/dist/umd/index.min.js" }));

// load google-analytics.js to get access to analytics
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./js/google-analytics.js" }));

document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/borsh.bundle.js" }));

document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "//unpkg.com/@concordium/browser-wallet-api-helpers@1.0.0/lib/concordiumHelpers.min.js" }));
//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "//unpkg.com/@concordium/web-sdk@2.1.0/lib/concordium.min.js" }));
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/concordium.min.js" }));

// load nearAPI.js to get access to Near API
// document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/nearAPI.js" }));

// load web3gl to connect to unity
window.web3gl = {
  networkId: 0,
  connect,
  connectAccount: "",
  signMessage,
  signMessageResponse: "",
  sendTransaction,
  sendTransactionResponse: "",
  sendContract,
  sendContractResponse: "",
  addNetwork,
  addNetworkResponse: "",
  changeChainId,
  getAllErc721,
  getAllErc721Response: "",
  methodCall,
  methodCallResponse: "",
  getTxStatus,
  getTxStatusResponse: "",
  getBalance,
  getBalanceResponse: "",
  connectNearWallet,
  connectNearWalletAccount: "",
  nearSendContract,
  nearSendContractResponse: "",
  nearMethodCall,
  nearMethodCallResponse: "",
  listNearNFTsWeb,
  listNearNFTsWebResponse: "",
  googleAnalyticsSendEvent
  
};

// will be defined after connect()
let provider;
let web3;

/*
paste this in inspector to connect to wallet:
window.web3gl.connect()
*/
async function connect() {
  if (window.web3ChainId == 1456327825)
  {
  	web3gl.connectAccount = await connectConcordiumWallet(false);
  	return;
  }
  // uncomment to enable torus and walletconnect
  const providerOptions = {
    // torus: {
    //   package: Torus,
    // },
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        infuraId: "635e974724fe49ca9b3414a63e5ac5d2",
          rpc: {
              137: 'https://polygon-rpc.com',
           },
           // chainId: "137",
           network: "matic",
           qrcode: true,
           qrcodeModalOptions: {
               mobileLinks: [
                   "metamask",
                   "trust",
               ]
           }
      },
    },
   //    "custom-polygon": {
   //     display: {
   //         logo: "https://polygon.technology/wp-content/uploads/2021/07/polygon-logo.svg",
   //         name: "WalletConnect Polygon",
   //         description: "Connect to your Wallet with Wallet connect"
   //     },
   //     package: WalletConnectProvider,
   //     options: {
   //         // Mikko's test key - don't copy as your mileage may vary
   //         //infuraId: "bb7b522604e54a2f8ad251e7417b2355",
   //         rpc: {
   //             137: 'https://matic-mainnet.chainstacklabs.com'
   //         },
   //         chainId: 137,
   //         network: "polygon",
   //         qrcode: true,
   //         qrcodeModalOptions: {
   //             mobileLinks: [
   //                 "metamask",
   //                 "trust",
   //             ]
   //         }
   //     }
   // },
  };

  const web3Modal = new window.Web3Modal.default({
    providerOptions,
  });

  web3Modal.clearCachedProvider();

  // set provider
  provider = await web3Modal.connect();
  web3 = new Web3(provider);

  // set current network id
  web3gl.networkId = parseInt(provider.chainId);

  // if current network id is not equal to network id, then switch
  if (web3gl.networkId != window.web3ChainId) {
    await window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${window.web3ChainId.toString(16)}` }], // chainId must be in hexadecimal numbers
        })
        .catch(() => {
          addNetwork(window.web3ChainId);
          //window.location.reload();
        });
  }

  // set current account

  if (provider.selectedAddress !== undefined) web3gl.connectAccount = provider.selectedAddress;
  else web3gl.connectAccount = provider.accounts[0];

  // refresh page if player changes account
  provider.on("accountsChanged", (accounts) => {
    window.location.reload();
  });

  // update if player changes network
  provider.on("chainChanged", (chainId) => {
    web3gl.networkId = parseInt(chainId);
  });
}

/*
paste this in inspector to connect to sign message:
window.web3gl.signMessage("hello")
*/
async function signMessage(message) {
  try {
    const from = (await web3.eth.getAccounts())[0];
    const signature = await web3.eth.personal.sign(message, from, "");
    window.web3gl.signMessageResponse = signature;
  } catch (error) {
    window.web3gl.signMessageResponse = error.message;
  }
}

/*
paste this in inspector to send eth:
const to = "0xdD4c825203f97984e7867F11eeCc813A036089D1"
const value = "12300000000000000"
const gasLimit = "21000" // gas limit
const gasPrice = "33333333333"
window.web3gl.sendTransaction(to, value, gasLimit, gasPrice);
*/
async function sendTransaction(to, value, gasLimit, gasPrice) {
  const from = (await web3.eth.getAccounts())[0];
  web3.eth
      .sendTransaction({
        from,
        to,
        value,
        gas: gasLimit ? gasLimit : undefined,
        gasPrice: gasPrice ? gasPrice : undefined,
      })
      .on("transactionHash", (transactionHash) => {
        window.web3gl.sendTransactionResponse = transactionHash;
      })
      .on("error", (error) => {
        window.web3gl.sendTransactionResponse = error.message;
      });
}

/*
paste this in inspector to connect to interact with contract:
const method = "increment"
const abi = `[ { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "x", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ]`;
const contract = "0xB6B8bB1e16A6F73f7078108538979336B9B7341C"
const args = "[]"
const value = "0"
const gasLimit = "222222" // gas limit
const gasPrice = "333333333333"
window.web3gl.sendContract(method, abi, contract, args, value, gasLimit, gasPrice)
*/
async function sendContract(method, abi, contract, args, value, gasLimit, gasPrice) {
  if (method == "purchase")
  {
  	googleAnalyticsSendEvent("purchase_nft");
  }

  if (window.web3ChainId == 1456327825)
  {
    let concResponse = await concrodiumSendContract(contract, method, args, value);
    if ( concResponse == "received" ) concResponse = "success";
    console.log(concResponse);
    console.log(typeof concResponse);
    if (typeof concResponse != "string")
    {
      window.web3gl.sendContractResponse = JSON.stringify(concResponse);
    }
    else
    {
      window.web3gl.sendContractResponse = concResponse;
    }
    console.log(window.web3gl.sendContractResponse);
    return;
  }

  const from = (await web3.eth.getAccounts())[0];
  new web3.eth.Contract(JSON.parse(abi), contract).methods[method](...JSON.parse(args))
      .send({
        from,
        value: value ? value : undefined,
        gas: gasLimit ? gasLimit : undefined,
        gasPrice: gasPrice ? gasPrice : undefined,
      })
      .on("transactionHash", (transactionHash) => {
        //window.web3gl.sendContractResponse = transactionHash;
      })
      .on('receipt', (receipt) => {
         console.log('create NFT RECEIPT');
         console.log(receipt);
         window.web3gl.sendContractResponse = JSON.stringify(receipt);
     })
      .on("error", (error) => {
        window.web3gl.sendContractResponse = error.message;
      });
}

async function addNetwork(chainId) {
    var eth;
    chainId = parseInt(chainId, 10);

    if (typeof ethereum !== 'undefined') {
        eth = new Web3(ethereum);
    } else if (typeof web3 !== 'undefined') {
        eth = new Web3(web3.givenProvider);
    } else {
        eth = new Web3(ethereum);
    }

    if (typeof eth !== 'undefined') {
        // let network = 0;
        // window.web3 = new Web3(window.ethereum);
        // network = await web3.eth.getChainId();
        // // network = await web3.eth.getChainId();
        // let netID = network.toString();   // if (netID === chainId.toString()) {
                                                  //     alert("Network has already been added to Metamask.");
                                                  //     return;
                                                  // } else {
        let params;

        console.log('addNetwork chainId ' + chainId);
		switch (chainId) {
            case 56 :
                params = [{
                    chainId: '0x38',
                    chainName: 'Binance Smart Chain Mainnet',
                    nativeCurrency: {
                        name: 'BNB',
                        symbol: 'BNB',
                        decimals: 18
                    },
                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com']
                }]
                break;
            case 97 :
                params = [{
                    chainId: '0x61',
                    chainName: 'Binance Smart Chain Testnet',
                    nativeCurrency: {
                        name: 'BNB',
                        symbol: 'BNB',
                        decimals: 18
                    },
                    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                    blockExplorerUrls: ['https://testnet.bscscan.com']
                }]
                break;
            case 137 :
                params = [{
                    chainId: '0x89',
                    chainName: 'Polygon Mainnet',
                    nativeCurrency: {
                        name: 'MATIC',
                        symbol: 'MATIC',
                        decimals: 18
                    },
                    rpcUrls: ['https://polygon-rpc.com/'],
                    blockExplorerUrls: ['https://polygonscan.com/']
                }]
                break;
            case 1313161555 :
                params = [{
                    chainId: '0x4E454153',
                    chainName: 'Aurora Testnet',
                    nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: ['https://aurora-testnet.infura.io/v3/bb7b522604e54a2f8ad251e7417b2355'],
                    blockExplorerUrls: ['https://testnet.aurorascan.dev']
                }]
                break;
            case 1313161554 :
                params = [{
                    chainId: '0x4E454152',
                    chainName: 'Aurora Mainnet',
                    nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: ['https://mainnet.aurora.dev'],
                    blockExplorerUrls: ['https://aurorascan.dev']
                }]
                break;
            case 2221 :
                params = [{
                    chainId: '0x8AD',
                    chainName: 'Kava EVM Testnet',
                    nativeCurrency: {
                        name: 'KAVA',
                        symbol: 'KAVA',
                        decimals: 18
                    },
                    rpcUrls: ['https://evm.evm-alpha.kava.io'],
                    blockExplorerUrls: ['https://explorer.evm-alpha.kava.io']
                }]
                break;
            case 2222 :
                params = [{
                    chainId: '0x8AE',
                    chainName: 'Kava EVM',
                    nativeCurrency: {
                        name: 'KAVA',
                        symbol: 'KAVA',
                        decimals: 18
                    },
                    rpcUrls: ['https://evm.kava.io'],
                    blockExplorerUrls: ['https://explorer.kava.io']
                }]
                break;
            case 1001 :
                params = [{
                    chainId: '0x3E9',
                    chainName: 'Klaytn Baobab',
                    nativeCurrency: {
                        name: 'KLAY',
                        symbol: 'KLAY',
                        decimals: 18
                    },
                    rpcUrls: ['https://api.baobab.klaytn.net:8651'],
                    blockExplorerUrls: ['https://baobab.scope.klaytn.com/']
                }]
                break;
            case 4 :
                params = [{
                    chainId: '0x4',
                    chainName: 'Rinkeby Test Network',
                    nativeCurrency: {
                        name: 'RinkebyETH',
                        symbol: 'RinkebyETH',
                        decimals: 18
                    },
                    rpcUrls: ['https://rinkeby.infura.io/v3/'],
                    blockExplorerUrls: ['https://rinkeby.etherscan.io/']
                }]
                break;
            case 15555 :
                params = [{
                    chainId: '0x3CC3',
                    chainName: 'Trust Tesnet',
                    nativeCurrency: {
                        name: 'EVM',
                        symbol: 'EVM',
                        decimals: 18
                    },
                    rpcUrls: ['https://api.testnet-dev.trust.one'],
                    blockExplorerUrls: ['https://trustscan.one']
                }]
                break;
            case 9000 :
                params = [{
                    chainId: '0x2328',
                    chainName: 'Evmos Testnet',
                    nativeCurrency: {
                        name: 'tEVMOS',
                        symbol: 'tEVMOS',
                        decimals: 18
                    },
                    rpcUrls: ['https://eth.bd.evmos.dev:8545'],
                    blockExplorerUrls: ['https://evm.evmos.dev']
                }]
                break;
            case 1281 :
                params = [{
                    chainId: '0x501',
                    chainName: 'Octopus Testnet',
                    nativeCurrency: {
                        name: 'EBAR',
                        symbol: 'EBAR',
                        decimals: 18
                    },
                    rpcUrls: ['https://gateway.testnet.octopus.network/barnacle-evm/wj1hhcverunusc35jifki19otd4od1n5'],
                    blockExplorerUrls: ['']
                }]
                break;
            case 1029 :
                params = [{
                    chainId: '0x405',
                    chainName: 'BitTorrent Chain Donau',
                    nativeCurrency: {
                        name: 'BTT',
                        symbol: 'BTT',
                        decimals: 18
                    },
                    rpcUrls: ['https://pre-rpc.bt.io/'],
                    blockExplorerUrls: ['https://testscan.bt.io/']
                }]
                break;
            case 50021 :
                params = [{
                    chainId: '0xC365',
                    chainName: 'GTON Testnet',
                    nativeCurrency: {
                        name: 'GCD',
                        symbol: 'GCD',
                        decimals: 18
                    },
                    rpcUrls: ['https://testnet.gton.network/'],
                    blockExplorerUrls: ['https://explorer.testnet.gton.network/']
                }]
                break;
            case 1456327825 :  // Not real, just for Concordium
                params = [{
                    chainId: '0x56CDCC91',
                    chainName: 'Concordium Testnet',
                    nativeCurrency: {
                        name: 'CCD',
                        symbol: 'CCD',
                        decimals: 18
                    },
                    rpcUrls: [''],
                    blockExplorerUrls: ['']
                }]
                break;
            default:
                alert('Network not supported to adding!');

        }
        if (chainId == 4)
        {
          window.ethereum
              .request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${window.web3ChainId.toString(16)}` }], // chainId must be in hexadecimal numbers
              });
              return;
        }
        else if (chainId == 1456327825)
        {
        	return;
        }
        console.log('addNetwork params' + JSON.stringify(params));
        window.ethereum.request({ method: 'wallet_addEthereumChain', params })
            .then(() => {
            	window.ethereum
			        .request({
			          method: "wallet_switchEthereumChain",
			          params: [{ chainId: `0x${window.web3ChainId.toString(16)}` }], // chainId must be in hexadecimal numbers
			        }).then(() => {
			        	console.log('Add Success');
			        	console.log('Switch Success');
			        	window.web3gl.addNetworkResponse = "Success";
			        })
			        .catch(() => {
			        	window.web3gl.addNetworkResponse = "Error";
			          	//window.location.reload();
			        });
            })
            .catch((error) => {
            	console.log("Error", error.message);
            	window.web3gl.addNetworkResponse = "Error";
            });
    } else {
        alert('Unable to locate a compatible web3 browser!');
        window.web3gl.addNetworkResponse = "Error";
    }     
}

async function changeChainId(chainId) {
	chainId = parseInt(chainId, 10);
  	window.web3ChainId = chainId;
  	addNetwork(window.web3ChainId);
}

async function getAllErc721(abi, nftUniV3ContractAddress) {
  if (window.web3ChainId == 1456327825)
  {
    let concResponse = JSON.stringify(await concordiumNftTokensForOwners(nftUniV3ContractAddress));
    console.log(concResponse);
    window.web3gl.getAllErc721Response = concResponse;
    return;
  }
	const from = (await web3.eth.getAccounts())[0];
 	const nftContract = new web3.eth.Contract(JSON.parse(abi), nftUniV3ContractAddress);
	let balance = parseInt(await nftContract.methods.balanceOf(from).call());
	let data = [];
	while (balance > 0) {
	    balance = balance -1;
	    const tokenID = await nftContract.methods.tokenOfOwnerByIndex(from,balance+'').call();
		const tokenURI = await nftContract.methods.tokenURI(tokenID).call();
		data.push({"contract": nftUniV3ContractAddress, "tokenId": tokenID, "uri": tokenURI, "balance":"1"});
	}
	window.web3gl.getAllErc721Response = JSON.stringify(data);
}

async function methodCall(abi, nftUniV3ContractAddress, method, args, value) {
  console.log(method);
  if (window.web3ChainId == 1456327825)
  {
    let concResponse = JSON.stringify(await concordiumMethodCall(nftUniV3ContractAddress, method, args, value));
    console.log(concResponse);
    window.web3gl.methodCallResponse = concResponse;
    return;
  }
  const from = (await web3.eth.getAccounts())[0];
  const nftContract = new web3.eth.Contract(JSON.parse(abi), nftUniV3ContractAddress);
  let response = await nftContract.methods[method](...JSON.parse(args))
  .call({
        from,
        value: value ? value : undefined
  });
  console.log(response);
  console.log(typeof response);
  if (typeof response != "string")
  {
    window.web3gl.methodCallResponse = JSON.stringify(response);
  }
  else
  {
    window.web3gl.methodCallResponse = response;
  }
  console.log(window.web3gl.methodCallResponse);
}

async function getTxStatus(transactionHash) {
  const from = (await web3.eth.getAccounts())[0];
  let response = await web3.eth.getTransactionReceipt(transactionHash);
  console.log(response);
  if (response.status == true)
  {
    response = "success"
  }
  else if (response.status == false)
  {
    response = "fail"
  }
  console.log(response);
  if (typeof response != "string")
  {
    window.web3gl.getTxStatusResponse = JSON.stringify(response);
  }
  else
  {
    window.web3gl.getTxStatusResponse = response;
  }
}

async function getBalance() {
  const from = (await web3.eth.getAccounts())[0];
  let response = parseInt(await web3.eth.getBalance(from));
  //response = response * Math.pow(10, -18);
  if (typeof response != "string")
  {
    window.web3gl.getBalanceResponse = JSON.stringify(response);
  }
  else
  {
    window.web3gl.getBalanceResponse = response;
  }
}

async function concrodiumSendContract(motoDexContract, method, args, value) {
    args = JSON.parse(args);
    console.log(args);
    console.log(args[0]);
    let response;
    try {
      switch (method) {
            case "purchase" :
                response = await concordiumPurchase(motoDexContract, parseInt(args[0]));
                break;
            case "addMoto" :
                response = await concordiumAddNft(motoDexContract,  String(args[0]), true);
                break;
            case "addTrack" :
                response = await concordiumAddNft(motoDexContract, String(args[0]), false);
                break;
            case "returnMoto" :
                response = await concordiumReturnNft(motoDexContract, String(args[0]), true);
                break;
            case "returnTrack" :
                response = await concordiumReturnNft(motoDexContract, String(args[0]), false);
                break;
            case "addHealthNFT" :
                response = await concordiumAddHealthNftParams(motoDexContract, String(args[0]),  String(args[1]));
                break;
            case "addHealthMoney" :
                response = await concordiumAddHealthMoney(motoDexContract, String(args[0]));
                break;
        default:
                alert('Method is not added');
      } 
    }catch (error) {
      console.log(method + " - " + error.message);
      response = "fail";
    }
    return response;
}

async function concordiumMethodCall(motoDexContract, method, args, value) {
  args = JSON.parse(args);
  console.log(args);
  console.log(args[0]);
  let response;
    switch (method) {
            case "tokenIdsAndOwners" :
                response = await concordiumTokenIdsAndOwners(motoDexContract);
                break;
            case "getPriceForType" :
                response = await concordiumValueInMainCoin(motoDexContract, parseInt(args[0]));
                response = JSON.parse(response);
                break;
            case "valueInMainCoin" :
                response = await concordiumValueInMainCoin(motoDexContract, parseInt(args[0]));
                response = JSON.parse(response);
                break;      
            case "getHealthForId" :
                response = await concordiumGetTokenHealth(motoDexContract, args[0]);
                response =  JSON.parse(response);
                break;
            case "getPercentForTrack" :
                response = await concordiumGetPercentForTrack(motoDexContract, args[0]);
                break;
            // case "getGameSessions" :
            //     response = await nearGetGameSessions(mainnet, motoDexContract[1]);
            //     break;
            // case "getAllGameBids" :
            //     response = await nearGetAllGameBids(mainnet, motoDexContract[1]);
            //     break;    
        default:
                alert('Method is not added'); 
  }
  return response;
}

async function connectConcordiumWallet(mainnet, routeBackURL) {
    console.log("Connecting to CCD... mainnet " + mainnet);
    const provider = await concordiumHelpers.detectConcordiumProvider();
    const accountAddress = await provider.connect();
    console.log("Connecting to CCD... accountAddress " + accountAddress);
    const client = await provider.getJsonRpcClient();
    const consensusStatus = await client.getConsensusStatus();
    const lastFinalizedBlock = await consensusStatus.lastFinalizedBlock;
    console.log("Connecting to CCD... lastFinalizedBlock " + lastFinalizedBlock);
    const acct = { credId: accountAddress };//new concordiumSDK.AccountAddress(accountAddress);
    console.log("Connecting to CCD... acct " + JSON.stringify(acct));

    const accountInfo = await client.getAccountInfo(acct);
    //console.log("Connecting to CCD... accountInfo.accountAmount " + accountInfo.accountAmount);
    const accountAmount = accountInfo.accountAmount;
    return accountAddress;
}

async function concordiumTokenIdsAndOwners(motoDexContract) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const contractName = motoDexContract;
  const receiveFunctionName = 'tokenIdsAndOwners';
  const methodName = contractName + '.' + receiveFunctionName;

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  var moduleFileBuffer = new Buffer(bin64, 'base64');

  const parameters = {
      "from_index":{"None":[]}, 
      "limit":{"None":[]}
  };

  const inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const result = await client.invokeContract(
      {
          invoker: new concordiumSDK.AccountAddress(accountAddress),
          contract: contractAddress,
          method: methodName,
          parameter: inputParams
      }
  );
  const rawReturnValue = Buffer.from(result.returnValue, 'hex');
  console.log(rawReturnValue);
  const schema = moduleFileBuffer; // Load schema from file
  const schemaVersion = concordiumSDK.SchemaVersion.V1;
  let returnValue = "";
  try{
    returnValue = concordiumSDK.deserializeReceiveReturnValue(rawReturnValue, schema, contractName, receiveFunctionName, schemaVersion);
  }
  catch (error) {
    console.log(methodName + error.message);
  }
  console.log(returnValue);
  if (returnValue == ""){
    return returnValue;
  }
  let structData = [];
  for (let i = 0; i < returnValue.length; i++) {
    const trackTokenID = returnValue[i].track_token_id.Some ? returnValue[i].track_token_id.Some[0] : "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    const trackType = returnValue[i].track_type.Some ? returnValue[i].track_type.Some[0] : "255";
    const motoTokenID = returnValue[i].moto_token_id.Some ? returnValue[i].moto_token_id.Some[0] : "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    const motoType = returnValue[i].moto_type.Some ? returnValue[i].moto_type.Some[0] : "255";
    const owner = returnValue[i].owner_id.Account[0];
    structData.splice(i, 0, [trackTokenID, trackType, motoTokenID, motoType, owner]);
  }
  let fullStructData = {"0":structData, "1":String(returnValue.length)};
  console.log(fullStructData);
  return fullStructData;
}

async function concordiumNftTokensForOwners(motoDexContract) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const contractName = motoDexContract;
  const receiveFunctionName = 'nftTokensForOwners';
  const methodName = contractName + '.' + receiveFunctionName;

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  var moduleFileBuffer = new Buffer(bin64, 'base64');

  const parameters = {
      "address":{"Account":[accountAddress]},
      "from_index": {"None":[]},
      "limit": {"None":[]}
  };

  const inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const result = await client.invokeContract(
      {
          invoker: new concordiumSDK.AccountAddress(accountAddress),
          contract: contractAddress,
          method: methodName,
          parameter: inputParams
      }
  );
  const rawReturnValue = Buffer.from(result.returnValue, 'hex');
  console.log(rawReturnValue);
  const schema = moduleFileBuffer; // Load schema from file
  const schemaVersion = concordiumSDK.SchemaVersion.V1;
  let returnValue = "";
  try{
    returnValue = concordiumSDK.deserializeReceiveReturnValue(rawReturnValue, schema, contractName, receiveFunctionName, schemaVersion);
  }
  catch (error) {
    console.log(methodName + error.message);
  }
  console.log(returnValue);
  if (returnValue == ""){
    return returnValue;
  }
  let structData = [];
  for (let i = 0; i < returnValue.length; i++) {
    const tokenID = returnValue[i].token_id;
    const tokenURI = returnValue[i].metadata.uri;
    const name = returnValue[i].metadata.name;
    const typeNft = returnValue[i].metadata.type_nft;
    structData.push({"contract": motoDexContract, "tokenId": tokenID, "uri": tokenURI, "balance":"1", "ItemData": {"name": name, "type": typeNft}});
  }
  console.log(structData);
  return structData;
}

async function concordiumGetTokenHealth(motoDexContract, tokenId) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const contractName = motoDexContract;
  const receiveFunctionName = 'getTokenHealth';
  const methodName = contractName + '.' + receiveFunctionName;

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  var moduleFileBuffer = new Buffer(bin64, 'base64');

  const parameters = {
      "token_id":tokenId // String
  };

  const inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const result = await client.invokeContract(
      {
          invoker: new concordiumSDK.AccountAddress(accountAddress),
          contract: contractAddress,
          method: methodName,
          parameter: inputParams
      }
  );
  const rawReturnValue = Buffer.from(result.returnValue, 'hex');
  console.log(rawReturnValue);
  const schema = moduleFileBuffer; // Load schema from file
  const schemaVersion = concordiumSDK.SchemaVersion.V1;
  const returnValue = concordiumSDK.deserializeReceiveReturnValue(rawReturnValue, schema, contractName, receiveFunctionName, schemaVersion);
  console.log(returnValue);
  return returnValue;
}

async function concordiumValueInMainCoin(motoDexContract, typeNft) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const contractName = motoDexContract;
  const receiveFunctionName = 'valueInMainCoin';
  const methodName = contractName + '.' + receiveFunctionName;

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  var moduleFileBuffer = new Buffer(bin64, 'base64');

  const parameters = {
      "type_nft":typeNft // Int
  };

  const inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const result = await client.invokeContract(
      {
          invoker: new concordiumSDK.AccountAddress(accountAddress),
          contract: contractAddress,
          method: methodName,
          parameter: inputParams
      }
  );
  const rawReturnValue = Buffer.from(result.returnValue, 'hex');
  console.log(rawReturnValue);
  const schema = moduleFileBuffer; // Load schema from file
  const schemaVersion = concordiumSDK.SchemaVersion.V1;
  const returnValue = concordiumSDK.deserializeReceiveReturnValue(rawReturnValue, schema, contractName, receiveFunctionName, schemaVersion);
  console.log(returnValue);
  return returnValue;
}

async function concordiumGetPercentForTrack(motoDexContract, tokenId) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const contractName = motoDexContract;
  const receiveFunctionName = 'getPercentForTrack';
  const methodName = contractName + '.' + receiveFunctionName;

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  var moduleFileBuffer = new Buffer(bin64, 'base64');

  const parameters = {
      "token_id":tokenId // String
  };

  const inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const result = await client.invokeContract(
      {
          invoker: new concordiumSDK.AccountAddress(accountAddress),
          contract: contractAddress,
          method: methodName,
          parameter: inputParams
      }
  );
  const rawReturnValue = Buffer.from(result.returnValue, 'hex');
  console.log(rawReturnValue);
  const schema = moduleFileBuffer; // Load schema from file
  const schemaVersion = concordiumSDK.SchemaVersion.V1;
  const returnValue = concordiumSDK.deserializeReceiveReturnValue(rawReturnValue, schema, contractName, receiveFunctionName, schemaVersion);
  console.log(returnValue);
  return returnValue;
}

async function concordiumMinimalFeeInUSD() {
  return 1;
}


async function concordiumPurchase(motoDexContract, typeNft) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const instanceInfo = await client.getInstanceInfo(
      contractAddress);

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  const contractName = motoDexContract;
  let receiveFunctionName = 'purchase';
  let methodName = contractName + '.' + receiveFunctionName;
  const moduleFileBuffer = new Buffer(bin64, 'base64');
  const parameters = {
      "referral":{"None":[]},
      "type_nft": typeNft // Int
  };
  let inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const value_in_main_coin = await concordiumValueInMainCoin(motoDexContract, typeNft);
  const amount = { microGtuAmount: BigInt(value_in_main_coin) };

  const txHash = await provider.sendTransaction(
      accountAddress,
      concordiumSDK.AccountTransactionType.Update,
      {
          amount: amount,
          contractAddress: contractAddress,
          receiveName: methodName,
          maxContractExecutionEnergy: 30000n,
          parameters: inputParams,
      },
      parameters,
      bin64
  );
  let txStatus = await client.getTransactionStatus(txHash);
  if ( txStatus.status == "received" ) window.location.reload(); 
  return txStatus.status;
}

async function concordiumAddHealthMoney(motoDexContract, tokenId) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const instanceInfo = await client.getInstanceInfo(
      contractAddress);

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  const contractName = motoDexContract;
  let receiveFunctionName = 'addHealthMoney';
  let methodName = contractName + '.' + receiveFunctionName;
  const moduleFileBuffer = new Buffer(bin64, 'base64');
  const parameters = {
      "token_id":tokenId // String
  };
  let inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const value_in_main_coin = await concordiumValueInMainCoin(motoDexContract, tokenId);
  const amount = { microGtuAmount: BigInt(value_in_main_coin) };

  const txHash = await provider.sendTransaction(
      accountAddress,
      concordiumSDK.AccountTransactionType.Update,
      {
          amount: amount,
          contractAddress: contractAddress,
          receiveName: methodName,
          maxContractExecutionEnergy: 30000n,
          parameters: inputParams,
      },
      parameters,
      bin64
  );
  const txStatus = await client.getTransactionStatus(txHash);
  return txStatus.status;
}

async function concordiumAddHealthNftParams(motoDexContract, tokenId, healthPillTokenId) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const instanceInfo = await client.getInstanceInfo(
      contractAddress);

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  const contractName = motoDexContract;
  let receiveFunctionName = 'addHealthNft';
  let methodName = contractName + '.' + receiveFunctionName;
  const moduleFileBuffer = new Buffer(bin64, 'base64');
  const parameters = {
      "token_id": tokenId, // String
      "health_pill_token_id": healthPillTokenId, // String
      "amount": "1",
      "owner":{"Account":[accountAddress]},
  };
  let inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const value_in_main_coin = await concordiumValueInMainCoin(motoDexContract, typeNft);
  const amount = { microGtuAmount: BigInt(value_in_main_coin) };

  const txHash = await provider.sendTransaction(
      accountAddress,
      concordiumSDK.AccountTransactionType.Update,
      {
          amount: amount,
          contractAddress: contractAddress,
          receiveName: methodName,
          maxContractExecutionEnergy: 30000n,
          parameters: inputParams,
      },
      parameters,
      bin64
  );
  const txStatus = await client.getTransactionStatus(txHash);
  return txStatus.status;
}

async function concordiumAddNft(motoDexContract, tokenId, isMoto) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const instanceInfo = await client.getInstanceInfo(
      contractAddress);

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  const contractName = motoDexContract;
  let receiveFunctionName = isMoto ? 'addMoto' : "addTrack";
  let methodName = contractName + '.' + receiveFunctionName;
  const moduleFileBuffer = new Buffer(bin64, 'base64');
  const parameters = {
      "token_id":tokenId, // String
      "previous_owner":{"Account":[accountAddress]},
  };
  let inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const minimal_fee_in_usd = await concordiumMinimalFeeInUSD();
  const amount = { microGtuAmount: BigInt(minimal_fee_in_usd) };

  const txHash = await provider.sendTransaction(
      accountAddress,
      concordiumSDK.AccountTransactionType.Update,
      {
          amount: amount,
          contractAddress: contractAddress,
          receiveName: methodName,
          maxContractExecutionEnergy: 30000n,
          parameters: inputParams,
      },
      parameters,
      bin64
  );
  //const txStatus = await provider.request("getTransactionStatus",{transactionHash:txHash});
  const txStatus = await client.getTransactionStatus(txHash);
  return txStatus.status;
}

async function concordiumReturnNft(motoDexContract, tokenId, isMoto) {
  const provider = await concordiumHelpers.detectConcordiumProvider();
  const accountAddress = await provider.connect();
  console.log("Connecting to CCD... accountAddress " + accountAddress);
  const client = await provider.getJsonRpcClient();
  const contractAddress = {
    subindex: 0n,
    index: 1857n,
  };

  const instanceInfo = await client.getInstanceInfo(
      contractAddress);

  const bin64 = '//8CAQAAAAcAAABNT1RPREVYAQAUAAMAAAALAAAAbWluaW1hbF9mZWUKGQAAAG1pbl9nYW1lX3Nlc3Npb25fZHVyYXRpb24FEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUvAAAADgAAAGFkZEhlYWx0aE1vbmV5BBQAAQAAAAgAAAB0b2tlbl9pZB0AFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDAAAAGFkZEhlYWx0aE5mdAQUAAQAAAAIAAAAdG9rZW5faWQdABQAAABoZWFsdGhfcGlsbF90b2tlbl9pZB0ABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgcAAABhZGRNb3RvBBQAAgAAAAgAAAB0b2tlbl9pZB0ADgAAAHByZXZpb3VzX293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAggAAABhZGRUcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAA4AAABwcmV2aW91c19vd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIJAAAAYmFsYW5jZU9mBhABFAACAAAACAAAAHRva2VuX2lkHQAHAAAAYWRkcmVzcxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwQARslAAAAFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCBgAAAGJpZEZvcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAA0AAABtb3RvX3Rva2VuX2lkHQAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIVAAAAY3JlYXRlT3JVcGRhdGVTZXNzaW9uBBQAAwAAAA4AAAB0cmFja190b2tlbl9pZB0ADQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhQAAABnZXRBY3RpdmVTZXNzaW9uc0lkcwEQAgQKAAAAZ2V0Q291bnRlcgEEFAAAAGdldEZpbmlzaGluZ1Nlc3Npb25zARACBAsAAABnZXRHYW1lQmlkcwIUAAEAAAAIAAAAdG9rZW5faWQdABACFAAFAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAGAAAAYW1vdW50Cg0AAABtb3RvX3Rva2VuX2lkHQAJAAAAdGltZXN0YW1wBQYAAABiaWRkZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDgAAAGdldEdhbWVTZXNzaW9uAhQAAQAAAAgAAAB0b2tlbl9pZB0AFAAKAAAACQAAAGluaXRfdGltZQUOAAAAdHJhY2tfdG9rZW5faWQdAAwAAABwYXJ0aWNpcGFudHMQAhQAAwAAAA0AAABtb3RvX293bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAABtb3RvX3Rva2VuX2lkHQAWAAAAbGFzdF90cmFja190aW1lX3Jlc3VsdA4SAAAAbGF0ZXN0X3VwZGF0ZV90aW1lBRgAAABsYXRlc3RfdHJhY2tfdGltZV9yZXN1bHQFCAAAAGF0dGVtcHRzAg0AAABnYW1lX2JpZHNfc3VtCg0AAABnYW1lX2ZlZXNfc3VtChMAAABjdXJyZW50X3dpbm5lcl9tb3RvFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0Dg0AAABlcG9jaF9wYXltZW50EAIVBAAAAAUAAABUcmFjawEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAgQAAABNb3RvAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBgAAAEJpZGRlcgEBAAAAFAADAAAABgAAAGFtb3VudAoLAAAAcmVjZWl2ZXJfaWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAHJlY2VpdmVyX3R5cGUWAggAAABQbGF0Zm9ybQEBAAAACgkAAABnZXRNaW5GZWUBCgwAAABnZXRNaW5GZWVVU0QBChsAAABnZXRNb3RvZGV4TWV0YWRhdGFCeVR5cGVOZnQCFAABAAAACAAAAHR5cGVfbmZ0AhQABwAAAAQAAABuYW1lFgILAAAAZGVzY3JpcHRpb24WAggAAAB0eXBlX25mdAIOAAAAY3VycmVudF9zdXBwbHkECgAAAHR5cGVfbGltaXQEDgAAAHR5cGVfcHJpY2VfdXNkCgMAAAB1cmkWAhIAAABnZXRQZXJjZW50Rm9yVHJhY2sCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFByaWNlRm9yVHlwZQIUAAEAAAAIAAAAdHlwZV9uZnQCCg8AAABnZXRQcmljZU1haW5Vc2QBCg4AAABnZXRUb2tlbkhlYWx0aAIUAAEAAAAIAAAAdG9rZW5faWQdAAoNAAAAZ2V0VG9rZW5Pd25lcgIUAAEAAAAIAAAAdG9rZW5faWQdABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwOAAAAZ2V0VG9rZW5UeXBlSWQCFAABAAAACAAAAHRva2VuX2lkHQACDwAAAGdldFRva2Vuc0hlYWx0aAEQAg8dAAoEAAAAbWludAQUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBgAAAHRva2VucxEAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhIAAABuZnRUb2tlbnNGb3JPd25lcnMCFAADAAAABwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGZyb21faW5kZXgVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAEBQAAAGxpbWl0FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABBACFAADAAAACAAAAHRva2VuX2lkHQAIAAAAb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCAAAAG1ldGFkYXRhFAAHAAAABAAAAG5hbWUWAgsAAABkZXNjcmlwdGlvbhYCCAAAAHR5cGVfbmZ0Ag4AAABjdXJyZW50X3N1cHBseQQKAAAAdHlwZV9saW1pdAQOAAAAdHlwZV9wcmljZV91c2QKAwAAAHVyaRYCCgAAAG9wZXJhdG9yT2YGEAEUAAIAAAAFAAAAb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMBwAAAGFkZHJlc3MVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMEAEBFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCAAAAHB1cmNoYXNlBBQAAgAAAAgAAAByZWZlcnJhbBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAdHlwZV9uZnQCFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHB1cmNoYXNlQmF0Y2gEFAACAAAACAAAAHJlZmVycmFsFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAB0eXBlX25mdF9saXN0EAICFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCCgAAAHJldHVybk1vdG8EFAACAAAACAAAAHRva2VuX2lkHQAJAAAAbmV3X293bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgsAAAByZXR1cm5UcmFjawQUAAIAAAAIAAAAdG9rZW5faWQdAAkAAABuZXdfb3duZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCDQAAAHNldEdhbWVTZXJ2ZXIEFAABAAAACwAAAGdhbWVfc2VydmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg4AAABzZXRIZWFsdGhGb3JJZAQUAAIAAAAHAAAAdHlwZV9pZB0ABQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRJbXBsZW1lbnRvcnMEFAACAAAAAgAAAGlkFgAMAAAAaW1wbGVtZW50b3JzEAIMFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEwAAAHNldE1pbkVwb2NoSW50ZXJ2YWwEFAABAAAACAAAAGludGVydmFsBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzZXRNaW5GZWUEFAABAAAABgAAAGFtb3VudAUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIZAAAAc2V0TWluR2FtZVNlc3Npb25JbnRlcnZhbAQUAAEAAAAIAAAAaW50ZXJ2YWwFFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEgAAAHNldFBlcmNlbnRGb3JUcmFjawQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhcAAABzZXRQZXJjZW50Rm9yVHJhY2tPd25lcgQUAAIAAAAOAAAAdHJhY2tfdG9rZW5faWQdAAoAAABwZXJjZW50YWdlAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAABzZXRQcmljZUZvclR5cGUEFAACAAAABwAAAHR5cGVfaWQCBQAAAHByaWNlBRUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAhMAAABzZXRQcmljZU1haW5Db2luVXNkBBQAAQAAAAUAAABwcmljZQUVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAc3VwcG9ydHMGEAEWABABFQMAAAAJAAAATm9TdXBwb3J0AgcAAABTdXBwb3J0AgkAAABTdXBwb3J0QnkBAQAAABAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAgkAAABzeW5jRXBvY2gGFAABAAAADgAAAHRyYWNrX3Rva2VuX2lkHQAUAAoAAAAJAAAAaW5pdF90aW1lBQ4AAAB0cmFja190b2tlbl9pZB0ADAAAAHBhcnRpY2lwYW50cxACFAADAAAADQAAAG1vdG9fb3duZXJfaWQVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMDQAAAG1vdG9fdG9rZW5faWQdABYAAABsYXN0X3RyYWNrX3RpbWVfcmVzdWx0DhIAAABsYXRlc3RfdXBkYXRlX3RpbWUFGAAAAGxhdGVzdF90cmFja190aW1lX3Jlc3VsdAUIAAAAYXR0ZW1wdHMCDQAAAGdhbWVfYmlkc19zdW0KDQAAAGdhbWVfZmVlc19zdW0KEwAAAGN1cnJlbnRfd2lubmVyX21vdG8UAAMAAAANAAAAbW90b19vd25lcl9pZBUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAbW90b190b2tlbl9pZB0AFgAAAGxhc3RfdHJhY2tfdGltZV9yZXN1bHQODQAAAGVwb2NoX3BheW1lbnQQAhUEAAAABQAAAFRyYWNrAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCBAAAAE1vdG8BAQAAABQAAwAAAAYAAABhbW91bnQKCwAAAHJlY2VpdmVyX2lkFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA0AAAByZWNlaXZlcl90eXBlFgIGAAAAQmlkZGVyAQEAAAAUAAMAAAAGAAAAYW1vdW50CgsAAAByZWNlaXZlcl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwNAAAAcmVjZWl2ZXJfdHlwZRYCCAAAAFBsYXRmb3JtAQEAAAAKFQQAAAAOAAAASW52YWxpZFRva2VuSWQCEQAAAEluc3VmZmljaWVudEZ1bmRzAgwAAABVbmF1dGhvcml6ZWQCBgAAAEN1c3RvbQEBAAAAFRgAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAIUAAAAVG9rZW5JZEFscmVhZHlFeGlzdHMCEwAAAEludm9rZUNvbnRyYWN0RXJyb3ICDQAAAFByaWNlTm90Rm91bmQCEgAAAFdyb25nUGF5bWVudEFtb3VudAIVAAAAUmVmZXJyYWxUcmFuc2ZlckVycm9yAg0AAABUcmFuc2ZlckVycm9yAgkAAABNYXRoRXJyb3ICDQAAAFdyb25nUmVmZXJyYWwCEwAAAFByaWNlTWFpbkNvaW5Jc1plcm8CDAAAAE5mdE5vdEV4aXN0cwIRAAAATmZ0TWlzbWF0Y2hlZFR5cGUCFgAAAE1hZ2ljQm94SXNOb3RTdXBwb3J0ZWQCEAAAAFplcm9Db3VudGVyRXJyb3ICCgAAAE5vdEFsbG93ZWQCEAAAAEdhbWVTZXNzaW9uRXJyb3ICDQAAAEdhbWVCaWRzRXJyb3ICEgAAAFRva2VuTm90T25Db250cmFjdAIVAAAAQmVsb3dNaW5FcG9jaEludGVydmFsAhcAAABJbmNvcnJlY3RTdGF0ZVBhcmFtZXRlcgABAAAACQAAAHBhcmFtZXRlchYCFwAAAE1vdG9kZXhNZXRhZGF0YU5vdEZvdW5kAhMAAABWaWV3Q29sbGVjdGlvbkVycm9yAAEAAAAEAAAAbmFtZRYCEQAAAHRva2VuSWRzQW5kT3duZXJzAhQAAgAAAAoAAABmcm9tX2luZGV4FQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAABAUAAABsaW1pdBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAAQQAhQABgAAAA4AAAB0cmFja190b2tlbl9pZBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAAB0ACgAAAHRyYWNrX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACDQAAAG1vdG9fdG9rZW5faWQVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAdAAkAAABtb3RvX3R5cGUVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAACCAAAAG93bmVyX2lkFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADA8AAABhY3RpdmVfc2Vzc2lvbnMVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAQAh0ADQAAAHRva2VuTWV0YWRhdGEGEAEdABABFAACAAAAAwAAAHVybBYBBAAAAGhhc2gVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAATIAAAAAIVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIIAAAAdHJhbnNmZXIEEAEUAAUAAAAIAAAAdG9rZW5faWQdAAYAAABhbW91bnQbJQAAAAQAAABmcm9tFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAIAAAB0bxUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhHQEVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVGAAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAhQAAABUb2tlbklkQWxyZWFkeUV4aXN0cwITAAAASW52b2tlQ29udHJhY3RFcnJvcgINAAAAUHJpY2VOb3RGb3VuZAISAAAAV3JvbmdQYXltZW50QW1vdW50AhUAAABSZWZlcnJhbFRyYW5zZmVyRXJyb3ICDQAAAFRyYW5zZmVyRXJyb3ICCQAAAE1hdGhFcnJvcgINAAAAV3JvbmdSZWZlcnJhbAITAAAAUHJpY2VNYWluQ29pbklzWmVybwIMAAAATmZ0Tm90RXhpc3RzAhEAAABOZnRNaXNtYXRjaGVkVHlwZQIWAAAATWFnaWNCb3hJc05vdFN1cHBvcnRlZAIQAAAAWmVyb0NvdW50ZXJFcnJvcgIKAAAATm90QWxsb3dlZAIQAAAAR2FtZVNlc3Npb25FcnJvcgINAAAAR2FtZUJpZHNFcnJvcgISAAAAVG9rZW5Ob3RPbkNvbnRyYWN0AhUAAABCZWxvd01pbkVwb2NoSW50ZXJ2YWwCFwAAAEluY29ycmVjdFN0YXRlUGFyYW1ldGVyAAEAAAAJAAAAcGFyYW1ldGVyFgIXAAAATW90b2RleE1ldGFkYXRhTm90Rm91bmQCEwAAAFZpZXdDb2xsZWN0aW9uRXJyb3IAAQAAAAQAAABuYW1lFgIOAAAAdXBkYXRlT3BlcmF0b3IEEAEUAAIAAAAGAAAAdXBkYXRlFQIAAAAGAAAAUmVtb3ZlAgMAAABBZGQCCAAAAG9wZXJhdG9yFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUYAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCFAAAAFRva2VuSWRBbHJlYWR5RXhpc3RzAhMAAABJbnZva2VDb250cmFjdEVycm9yAg0AAABQcmljZU5vdEZvdW5kAhIAAABXcm9uZ1BheW1lbnRBbW91bnQCFQAAAFJlZmVycmFsVHJhbnNmZXJFcnJvcgINAAAAVHJhbnNmZXJFcnJvcgIJAAAATWF0aEVycm9yAg0AAABXcm9uZ1JlZmVycmFsAhMAAABQcmljZU1haW5Db2luSXNaZXJvAgwAAABOZnROb3RFeGlzdHMCEQAAAE5mdE1pc21hdGNoZWRUeXBlAhYAAABNYWdpY0JveElzTm90U3VwcG9ydGVkAhAAAABaZXJvQ291bnRlckVycm9yAgoAAABOb3RBbGxvd2VkAhAAAABHYW1lU2Vzc2lvbkVycm9yAg0AAABHYW1lQmlkc0Vycm9yAhIAAABUb2tlbk5vdE9uQ29udHJhY3QCFQAAAEJlbG93TWluRXBvY2hJbnRlcnZhbAIXAAAASW5jb3JyZWN0U3RhdGVQYXJhbWV0ZXIAAQAAAAkAAABwYXJhbWV0ZXIWAhcAAABNb3RvZGV4TWV0YWRhdGFOb3RGb3VuZAITAAAAVmlld0NvbGxlY3Rpb25FcnJvcgABAAAABAAAAG5hbWUWAg8AAAB2YWx1ZUluTWFpbkNvaW4CFAABAAAACAAAAHR5cGVfbmZ0AgoEAAAAdmlldwEUAAgAAAAFAAAAc3RhdGUQAg8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMFAACAAAADAAAAG93bmVkX3Rva2VucxACHQAJAAAAb3BlcmF0b3JzEAIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQEAAAAMCgAAAGFsbF90b2tlbnMQAg8dABUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwLAAAAbWluaW1hbF9mZWUFEgAAAG1pbl9lcG9jaF9pbnRlcnZhbAUTAAAAbGF0ZXN0X2Vwb2NoX3VwZGF0ZQUZAAAAbWluX2dhbWVfc2Vzc2lvbl9kdXJhdGlvbgUTAAAAcHJpY2VfbWFpbl9jb2luX3VzZAUHAAAAY291bnRlcgQ=';

  const contractName = motoDexContract;
  let receiveFunctionName = isMoto ? 'returnMoto' : "returnTrack";
  let methodName = contractName + '.' + receiveFunctionName;
  const moduleFileBuffer = new Buffer(bin64, 'base64');
  const parameters = {
      "token_id":tokenId, // String
      "new_owner":{"Account":[accountAddress]},
  };
  let inputParams = concordiumSDK.serializeUpdateContractParameters(
      contractName,
      receiveFunctionName,
      parameters,
      moduleFileBuffer,
      0
  );

  const amount = { microGtuAmount: BigInt(0) };

  const txHash = await provider.sendTransaction(
      accountAddress,
      concordiumSDK.AccountTransactionType.Update,
      {
          amount: amount,
          contractAddress: contractAddress,
          receiveName: methodName,
          maxContractExecutionEnergy: 30000n,
          parameters: inputParams,
      },
      parameters,
      bin64
  );
  const txStatus = await client.getTransactionStatus(txHash);
  return txStatus.status;
}



async function connectNearWallet(mainnet, routeBackURL) {
    console.log("Connecting to NEAR... network " + mainnet)
    mainnet = await checkNetwork(mainnet);
    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });

    const wallet = new nearApi.WalletConnection(near, 'OpenBiSea');
    const successUrl = (routeBackURL !== undefined) ? routeBackURL : window.location.href;
    //console.log("connectNearWallet successUrl " + successUrl +" routeBackURL " + routeBackURL)

    if(!wallet.isSignedIn())
        await wallet.requestSignIn({
            title:'OpenBiSea',
            successUrl: successUrl,
            failureUrl: (routeBackURL !== undefined) ? routeBackURL : window.location.href
        });
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");
    console.log("Near Wallet: " + JSON.parse(account.connection.signer.keyStore.localStorage.OpenBiSea_wallet_auth_key).accountId);
    window.web3gl.connectNearWalletAccount = JSON.parse(account.connection.signer.keyStore.localStorage.OpenBiSea_wallet_auth_key).accountId;
    return wallet;
}

async function nearGetPriceForType(mainnet, motoDexContract, type) {
    mainnet = await checkNetwork(mainnet);
    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");

    const contract = new nearApi.Contract(
        account, // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            viewMethods: ["value_in_main_coin", "get_price_for_type"], // view methods do not change state but usually return a value
            sender: account, // account object to initialize and sign transactions.
        }
    );
    // console.log("contract " + contract);

    const value_in_main_coin = await contract.value_in_main_coin({ type_nft: parseInt(type) });
    const value_in_main_coin_float = parseFloat(value_in_main_coin) * 1.02;
    const value_in_main_coinFull = eToNumber(value_in_main_coin_float.toLocaleString('fullwide', {useGrouping:false}));

    const get_price_for_type = await contract.get_price_for_type({ type_nft: parseInt(type) });
    const get_price_for_typeFull = eToNumber(get_price_for_type.toLocaleString('fullwide', {useGrouping:false}));
    console.log("nearGetPriceForType value_in_main_coinFull " + value_in_main_coinFull + ' get_price_for_typeFull ' + get_price_for_typeFull + " motoDexContract " + motoDexContract);
    return JSON.stringify({value_in_main_coin: value_in_main_coinFull, value_in_main_coin_correct: value_in_main_coin, get_price_for_type: get_price_for_typeFull});
}

async function nearMinimalFeeInUSD(mainnet, motoDexContract) {
    mainnet = await checkNetwork(mainnet);
    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");

    const contract = new nearApi.Contract(
        account, // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            viewMethods: ["get_minimal_fee", "value_in_main_coin"], // view methods do not change state but usually return a value
            sender: account, // account object to initialize and sign transactions.
        }
    );
    // console.log("contract " + contract);

	 console.log("nearMinimalFeeInUSD motoDexContract: " + motoDexContract);
    const minimal_fee_in_usd = await contract.get_minimal_fee();
    console.log(minimal_fee_in_usd);

    // const value_in_main_coin = await contract.value_in_main_coin({ type_nft: parseInt(minimal_fee_in_usd) });
    // const value_in_main_coin_float = parseFloat(value_in_main_coin) * 1.001;
    // const value_in_main_coinFull = eToNumber(value_in_main_coin_float.toLocaleString('fullwide', {useGrouping:false}));
    //const value_in_main_coinFull = eToNumber("16666666666666666666666666");

    console.log("nearMinimalFeeInUSD minimal_fee_in_usd " + minimal_fee_in_usd + " motoDexContract " + motoDexContract);
    return JSON.stringify({minimal_fee_in_usd: minimal_fee_in_usd});
}

async function nearHealthInWei(mainnet, motoDexContract, tokenId) {
    mainnet = await checkNetwork(mainnet);
    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");

    const contract = new nearApi.Contract(
        account, // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            viewMethods: ["get_token_health"], // view methods do not change state but usually return a value
            sender: account, // account object to initialize and sign transactions.
        }
    );

	  console.log("nearHealthInWei motoDexContract: " + motoDexContract);
    const health_in_wei = await contract.get_token_health({ token_id : tokenId });
    console.log(health_in_wei);

    console.log("nearMinimalFeeInUSD health_in_wei " + health_in_wei + " motoDexContract " + motoDexContract);
    return JSON.stringify({health_in_wei:health_in_wei});
}

async function nearGetPercentForTrack(mainnet, motoDexContract, tokenId) {
    mainnet = await checkNetwork(mainnet);
    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");

    const contract = new nearApi.Contract(
        account, // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            viewMethods: ["get_percent_for_track"], // view methods do not change state but usually return a value
            sender: account, // account object to initialize and sign transactions.
        }
    );

	  console.log("nearGetPercentForTrack motoDexContract: " + motoDexContract);
    const response = await contract.get_percent_for_track({ token_id : tokenId });
    console.log(response);

    console.log("nearMinimalFeeInUSD get_percent_for_track " + response + " motoDexContract " + motoDexContract);
    return JSON.stringify(response);
}

async function nearGetGameSessions(mainnet, motoDexContract) {
    mainnet = await checkNetwork(mainnet);
    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");

    const contract = new nearApi.Contract(
        account, // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            viewMethods: ["get_active_sessions_full_view"], // view methods do not change state but usually return a value
            sender: account, // account object to initialize and sign transactions.
        }
    );

	  console.log("nearGetGameSessions motoDexContract: " + motoDexContract);
    const response = await contract.get_active_sessions_full_view();
    console.log(response);

    console.log("nearMinimalFeeInUSD get_active_sessions_full_view " + response + " motoDexContract " + motoDexContract);
    return JSON.stringify(response);
}

async function nearGetAllGameBids(mainnet, motoDexContract) {
    mainnet = await checkNetwork(mainnet);
    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");

    const contract = new nearApi.Contract(
        account, // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            viewMethods: ["get_game_bids_paged"], // view methods do not change state but usually return a value
            sender: account, // account object to initialize and sign transactions.
        }
    );

	console.log("nearGetAllGameBids motoDexContract: " + motoDexContract);
    const response = await contract.get_game_bids_paged();
    console.log(response);

    console.log("nearMinimalFeeInUSD get_game_bids_paged " + response + " motoDexContract " + motoDexContract);
    return JSON.stringify(response);
}

async function nearBuyNFTFor(mainnet, motoDexContract, type, referral) {
    console.log("motoDexBuyNFTFor motoDexContract " + motoDexContract + "; NFT type " + type);
    mainnet = await checkNetwork(mainnet);

    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            changeMethods: ["purchase"],
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    // const amountString = eToNumber(amountInt);
    let parameters = {type_nft:type};
    if (referral !== null && referral !== undefined && referral.length > 2) parameters = {type_nft:type,referral:referral};
    const prices = await nearGetPriceForType(mainnet, motoDexContract, type);
    const pricesJSON = JSON.parse(prices);
    const value_in_main_coin = pricesJSON.value_in_main_coin;
    const buyResponse = await contract.purchase(parameters, "300000000000000", value_in_main_coin);
    return JSON.stringify(buyResponse);
}

async function nearAddHealthMoney(mainnet, motoDexContract, tokenId, healthPillTokenId, value) {
    console.log("motoDexBuyNFTFor motoDexContract " + motoDexContract + "; NFT type " + type);
    mainnet = await checkNetwork(mainnet);

    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            changeMethods: ["add_health_money"],
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    let parameters = {token_id:tokenId};
    if (healthPillTokenId !== null && healthPillTokenId !== undefined && healthPillTokenId.length > 2) parameters = {token_id:tokenId,health_pill_token_id:healthPillTokenId};
    const addHealthMoneyResponse = await contract.add_health_money(parameters, "300000000000000", value_in_main_coin);
    return JSON.stringify(addHealthMoneyResponse);
}

async function nearAddMoto(mainnet, motoDexContract, tokenId) {
    console.log("nearAddMoto motoDexContract " + motoDexContract + "; NFT tokenId " + tokenId);
    mainnet = await checkNetwork(mainnet);

    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });

    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            changeMethods: ["add_moto"],
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");
    const accountId = JSON.parse(account.connection.signer.keyStore.localStorage.OpenBiSea_wallet_auth_key).accountId;

    // const amountString = eToNumber(amountInt);
    // let parameters = {token_id:tokenId};

    const prices = await nearMinimalFeeInUSD(mainnet, motoDexContract[1]);
    const pricesJSON = JSON.parse(prices);
    const minimal_fee_in_usd = pricesJSON.minimal_fee_in_usd;
    // const addResponse = await contract.add_moto(parameters, "300000000000000", minimal_fee_in_usd);
    // return JSON.stringify(addResponse);

    const transactions = await nearAddTransactions(accountId, motoDexContract, tokenId, minimal_fee_in_usd, true); 
    return wallet.requestSignTransactions({ transactions });
}

async function nearAddTrack(mainnet, motoDexContract, tokenId) {
    console.log("nearAddTrack motoDexContract " + motoDexContract + "; NFT tokenId " + tokenId);
    mainnet = await checkNetwork(mainnet);

    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });

    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        motoDexContract[0],// name of contract you're connecting to
        {
            changeMethods: ["add_track"],
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");
    const accountId = JSON.parse(account.connection.signer.keyStore.localStorage.OpenBiSea_wallet_auth_key).accountId;
    
    // // const amountString = eToNumber(amountInt);
    // let parameters = {token_id:tokenId};
    const prices = await nearMinimalFeeInUSD(mainnet, motoDexContract[1]);
    const pricesJSON = JSON.parse(prices);
    const minimal_fee_in_usd = pricesJSON.minimal_fee_in_usd;
    // const addResponse = await contract.add_moto(parameters, "300000000000000", minimal_fee_in_usd);
    // return JSON.stringify(addResponse);

    const transactions = await nearAddTransactions(accountId, motoDexContract, tokenId, minimal_fee_in_usd, false); 
    return wallet.requestSignTransactions({ transactions });
}

async function nearReturnMoto(mainnet, motoDexContract, tokenId) {
    console.log("nearReturnMoto motoDexContract " + motoDexContract + "; NFT tokenId " + tokenId);
    mainnet = await checkNetwork(mainnet);

    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });

    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        motoDexContract[0],// name of contract you're connecting to
        {
            changeMethods: ["return_moto"],
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");
    const accountId = JSON.parse(account.connection.signer.keyStore.localStorage.OpenBiSea_wallet_auth_key).accountId;
    console.log("accountId: " + accountId);
    
    // // const amountString = eToNumber(amountInt);
    // let parameters = {token_id:tokenId};
    // const prices = await nearMinimalFeeInUSD(mainnet, motoDexContract[1]);
    // const pricesJSON = JSON.parse(prices);
    const minimal_fee_in_usd = "1";
    // const addResponse = await contract.add_moto(parameters, "300000000000000", minimal_fee_in_usd);
    // return JSON.stringify(addResponse);

    const transactions = await nearReturnTransactions(accountId, motoDexContract, tokenId, minimal_fee_in_usd, true); 
    return wallet.requestSignTransactions({ transactions });
}

async function nearReturnTrack(mainnet, motoDexContract, tokenId) {
    console.log("nearReturnTrack motoDexContract " + motoDexContract + "; NFT tokenId " + tokenId);
    mainnet = await checkNetwork(mainnet);

    const near = new nearApi.Near({
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        networkId: mainnet ? 'default' : 'testnet',
        nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
        walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
    });

    let wallet = await connectNearWallet(mainnet)
    // const contract = new nearApi.Contract(
    //     wallet.account(), // the account object that is connecting
    //     motoDexContract[0],// name of contract you're connecting to
    //     {
    //         changeMethods: ["return_track"],
    //         sender: wallet.account(), // account object to initialize and sign transactions.
    //     }
    // );
    const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");
    const accountId = JSON.parse(account.connection.signer.keyStore.localStorage.OpenBiSea_wallet_auth_key).accountId;
    console.log("accountId: " + accountId);
    
    // // const amountString = eToNumber(amountInt);
    // let parameters = {token_id:tokenId};
    // const prices = await nearMinimalFeeInUSD(mainnet, motoDexContract[1]);
    // const pricesJSON = JSON.parse(prices);
    const minimal_fee_in_usd = "1";
    console.log("minimal_fee_in_usd: " + minimal_fee_in_usd);
    // const addResponse = await contract.add_moto(parameters, "300000000000000", minimal_fee_in_usd);
    // return JSON.stringify(addResponse);

    const transactions = await nearReturnTransactions(accountId, motoDexContract, tokenId, minimal_fee_in_usd, false); 
    return wallet.requestSignTransactions({ transactions });
}


async function nearAddTransactions(accountId, motoDexContract, tokenId, minimalFee, addMoto = true) {
  const transactions = [];

  // Create transfer transaction
  // "receiver_id": "'$MOTODEX_CONTRACT'", "token_id": "1", "msg": "{\"action\":{\"type\":\"AddTrack\"}}"
  // const transferAction = {
  //     args: {
  //         receiver_id: motoDexContract[1], // NFT CONTRACT
  //         token_id: tokenId,
  //         msg: JSON.stringify({ action: { type: addMoto ? "AddMoto" : "AddTrack" } }),
  //     },
  //     gas: '50000000000000',
  //     deposit: "1",
  //     methodName: "nft_transfer_call",
  // };
  // const transferTransaction = await actionsToTransaction(
  //     accountId,
  //     motoDexContract[0],
  //     [transferAction]
  // );

  // transactions.push(transferTransaction);

  const addNFTAction = {
      args: {
          token_id: tokenId,
      },
      gas: '50000000000000',
      deposit: minimalFee, //nearApi.utils.format.parseNearAmount("0.1"),
      methodName: addMoto ? "add_moto" : "add_track",
  };
  const addNFTTransaction = await actionsToTransaction(
      accountId,
      motoDexContract[1],
      [addNFTAction]
  );

  transactions.push(addNFTTransaction);

  // return transactions
  return transactions;
}

async function nearReturnTransactions(accountId, motoDexContract, tokenId, minimalFee, returnMoto = true) {
  const transactions = [];

  const returnNFTAction = {
      args: {
          token_id: tokenId,
      },
      gas: '50000000000000',
      deposit: minimalFee,
      methodName: returnMoto ? "return_moto" : "return_track",
  };
  const returnNFTTransaction = await actionsToTransaction(
      accountId,
      motoDexContract[1],
      [returnNFTAction]
  );

  transactions.push(returnNFTTransaction);

  // return transactions
  return transactions;
}

async function actionsToTransaction(accountId, receiverId, actions) {
  return await createTx(
      accountId,
      receiverId,
      actions.map((action) =>
          nearApi.transactions.functionCall(
              action.methodName,
              action.args,
              action.gas,
              action.deposit,
          )
      )
  );
}

async function createTx(
    accountId,
    receiverId,
    actions,
    nonceOffset = 1
) {
    let wallet = await connectNearWallet();
    console.log('connection', wallet);
    // if (!wallet.isSignedIn()) {
    //     await wallet.requestSignIn(
    //         contractAccount,
    //         'MotoDex'
    //     );
    // }
    const account = wallet.account();

    const connection = account.connection;

    account.accountId = accountId;
    const localKey = await connection.signer.getPublicKey(
        account.accountId,
        connection.networkId
    );

    const accessKey = await account.accessKeyForTransaction(
        receiverId,
        actions,
        localKey
    );

    if (!accessKey) {
        throw new Error(
            `Cannot find matching key for transaction sent to ${receiverId}`
        );
    }

    const block = await connection.provider.block({ finality: "final" });
    const blockHash = borsh.baseDecode(block.header.hash);

    const publicKey = nearApi.utils.PublicKey.from(accessKey.public_key);
    const nonce = accessKey.access_key.nonce + nonceOffset;

    return nearApi.transactions.createTransaction(
        account.accountId,
        publicKey,
        receiverId,
        nonce,
        actions,
        blockHash
    );
}

async function listNearNFTsWeb(mainnet, contractAddress, selectedAccount) {
	  console.log("listNearNFTsWeb network " + mainnet + "; motoDexContract " + contractAddress + "; selectedAccount " + selectedAccount);
    mainnet = await checkNetwork(mainnet);
    
    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        contractAddress,// name of contract you're connecting to
        {
            viewMethods: ["nft_tokens_for_owners"], // view methods do not change state but usually return a value
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    // console.log("listNearNFTsWeb contract " + contract);

    const nft_tokens_for_owner = await contract.nft_tokens_for_owners({ account_id: selectedAccount });
    window.web3gl.listNearNFTsWebResponse = JSON.stringify(nft_tokens_for_owner);
    return JSON.stringify(nft_tokens_for_owner);
}

async function nearSendContract(mainnet, motoDexContract, method, args, value) {
    args = JSON.parse(args);
    motoDexContract = JSON.parse(motoDexContract);
    console.log(args);
    console.log(args[0]);
  	let response;
    mainnet = await checkNetwork(mainnet);
    switch (method) {
            case "purchase" :
                response = await nearBuyNFTFor(mainnet, motoDexContract[0], parseInt(args[0]), args[1]);
                break;
            case "addMoto" :
                response = await nearAddMoto(mainnet, motoDexContract,  String(args[0]));
                break;
            case "addTrack" :
                response = await nearAddTrack(mainnet, motoDexContract, String(args[0]));
                break;
            case "returnMoto" :
                response = await nearReturnMoto(mainnet, motoDexContract, String(args[0]));
                break;
            case "returnTrack" :
                response = await nearReturnTrack(mainnet, motoDexContract, String(args[0]));
                break;
            case "addHealthNFT" :
                response = await nearAddHealthMoney(mainnet, motoDexContract, String(args[0]),  String(args[1]), parseInt(value));
                break;
            case "addHealthMoney" :
                response = await nearAddHealthMoney(mainnet, motoDexContract, String(args[0]), null, value);
                break;
   			default:
                alert('Method is not added'); 
	  }
	  if (typeof response != "string")
  	{
    	window.web3gl.nearSendContractResponse = JSON.stringify(response);
  	}
  	else
  	{
    	window.web3gl.nearSendContractResponse = response;
  	}
}

async function nearMethodCall(mainnet, motoDexContract, method, args, value) {
	args = JSON.parse(args);
    motoDexContract = JSON.parse(motoDexContract);
    console.log(args);
    console.log(args[0]);
	let response;
  	mainnet = await checkNetwork(mainnet);
    switch (method) {
            case "tokenIdsAndOwners" :
                response = await nearTokenIdsAndOwners(mainnet, motoDexContract[1]);
                break;
            case "getPriceForType" :
                response = await nearGetPriceForType(mainnet, motoDexContract[1], parseInt(args[0]));
                response = JSON.parse(response).get_price_for_type;
                break;
            case "valueInMainCoin" :
                response = await nearGetPriceForType(mainnet, motoDexContract[1], parseInt(args[0]));
                response = JSON.parse(response).value_in_main_coinFull;
                break;
            case "valueInMainCoinCorrect" :
                response = await nearGetPriceForType(mainnet, motoDexContract[1], parseInt(args[0]));
                response = JSON.parse(response).value_in_main_coin_correct;
                break;      
            case "getHealthForId" :
                response = await nearHealthInWei(mainnet, motoDexContract[1], args[0]);
                response =  JSON.parse(response).health_in_wei;
                break;
            case "getPercentForTrack" :
                response = await nearGetPercentForTrack(mainnet, motoDexContract[1], args[0]);
                break;
            case "getGameSessions" :
                response = await nearGetGameSessions(mainnet, motoDexContract[1]);
                break;
            case "getAllGameBids" :
                response = await nearGetAllGameBids(mainnet, motoDexContract[1]);
                break;    
   			default:
                alert('Method is not added'); 
	}
	if (typeof response != "string")
  	{
    	window.web3gl.nearMethodCallResponse = JSON.stringify(response);
  	}
  	else
  	{
    	window.web3gl.nearMethodCallResponse = response;
  	}
}
async function nearTokenIdsAndOwners(mainnet, motoDexContract) {
	mainnet = await checkNetwork(mainnet);
  const near = new nearApi.Near({
      keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
      networkId: mainnet ? 'default' : 'testnet',
      nodeUrl: mainnet ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
      walletUrl: mainnet ? 'https://wallet.near.org' : 'https://wallet.testnet.near.org'
  });
  const account = await near.account(mainnet ? "openbisea.near" : "openbisea1.testnet");

  const contract = new nearApi.Contract(
      account, // the account object that is connecting
      motoDexContract,// name of contract you're connecting to
      {
          viewMethods: ["token_ids_and_owners"], // view methods do not change state but usually return a value
          sender: account, // account object to initialize and sign transactions.
      }
  );

	console.log("nearTokenIdsAndOwners motoDexContract: " + motoDexContract);
  const token_ids_and_owners = await contract.token_ids_and_owners();
  console.log("nearTokenIdsAndOwners");
  console.log(token_ids_and_owners);
  return JSON.stringify(token_ids_and_owners);
}


function eToNumber(num) {
    let sign = "";
    (num += "").charAt(0) == "-" && (num = num.substring(1), sign = "-");
    let arr = num.split(/[e]/ig);
    if (arr.length < 2) return sign + num;
    let dot = (.1).toLocaleString().substr(1, 1), n = arr[0], exp = +arr[1],
        w = (n = n.replace(/^0+/, '')).replace(dot, ''),
        pos = n.split(dot)[1] ? n.indexOf(dot) + exp : w.length + exp,
        L   = pos - w.length, s = "" + BigInt(w);
    w   = exp >= 0 ? (L >= 0 ? s + "0".repeat(L) : r()) : (pos <= 0 ? "0" + dot + "0".repeat(Math.abs(pos)) + s : r());
    L= w.split(dot); if (L[0]==0 && L[1]==0 || (+w==0 && +s==0) ) w = 0; //** added 9/10/2021
    return sign + w;
    function r() {return w.replace(new RegExp(`^(.{${pos}})(.)`), `$1${dot}$2`)}
}

async function checkNetwork(mainnet) {
  switch (mainnet) {
        case "testnet" :
          mainnet = false;
          break;
        case "mainnet" :
          mainnet = true;
          break;
        default:
          mainnet = false; 
  }
  return mainnet;
}

async function googleAnalyticsSendEvent(eventName) {
	console.log("googleAnalyticsSendEvent: " + eventName);
	gtag('event', eventName, { eventName: true });
}

// View methods
// !!tokenURI : tokenId (uint256)
// !!getHealthForId : tokenId (uint256)
// !!getPercentForTrack : tokenId (uint256)
// balanceOf : owner (address)
// latestEpochUpdate : "[]"
// !!getGameSessions : "[]"
// !!getAllGameBids : "[]"
// getLatestPrice : "[]"
// syncEpochResultsBidsFinal : "[]"
// syncEpochResultsMotosFinal : "[]"
// getLimitsAndCounters : "[]"

// Change methods
// addHealthNFT : ""; tokenId (uint256), healthPillTokenId (uint256)
// bidFor : bidFor; trackTokenId (uint8), motoTokenId (uint8)
// addHealthMoney : addHealthMoney; tokenId (uint256)