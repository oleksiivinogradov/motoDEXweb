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
  listNearNFTsWebResponse: ""
  
};

// will be defined after connect()
let provider;
let web3;

/*
paste this in inspector to connect to wallet:
window.web3gl.connect()
*/
async function connect() {
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
    const value_in_main_coinFull = eToNumber(value_in_main_coin.toLocaleString('fullwide', {useGrouping:false}));

    const get_price_for_type = await contract.get_price_for_type({ type_nft: parseInt(type) });
    const get_price_for_typeFull = eToNumber(get_price_for_type.toLocaleString('fullwide', {useGrouping:false}));
    console.log("nearGetPriceForType value_in_main_coinFull " + value_in_main_coinFull + ' get_price_for_typeFull ' + get_price_for_typeFull + " motoDexContract " + motoDexContract);
    return JSON.stringify({value_in_main_coin: value_in_main_coinFull, get_price_for_type: get_price_for_typeFull});
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
            viewMethods: ["minimal_fee_in_usd", "value_in_main_coin"], // view methods do not change state but usually return a value
            sender: account, // account object to initialize and sign transactions.
        }
    );
    // console.log("contract " + contract);

    // const minimal_fee_in_usd = await contract.minimal_fee_in_usd();
    // console.log(minimal_fee_in_usd);
    // const value_in_main_coin = await contract.value_in_main_coin({ type_nft: parseInt(minimal_fee_in_usd) });
    // const value_in_main_coinFull = eToNumber(value_in_main_coin.toLocaleString('fullwide', {useGrouping:false}));
    const value_in_main_coinFull = eToNumber("1778827035712731");

    console.log("nearMinimalFeeInUSD value_in_main_coinFull " + value_in_main_coinFull + " motoDexContract " + motoDexContract);
    return JSON.stringify({minimal_fee_in_usd: value_in_main_coinFull});
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

async function nearAddMoto(mainnet, motoDexContract, tokenId) {
    console.log("nearAddMoto motoDexContract " + motoDexContract + "; NFT tokenId " + tokenId);
    mainnet = await checkNetwork(mainnet);

    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            changeMethods: ["add_moto"],
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    // const amountString = eToNumber(amountInt);
    let parameters = {token_id:tokenId};
    const prices = await nearMinimalFeeInUSD(mainnet, motoDexContract);
    const pricesJSON = JSON.parse(prices);
    const minimal_fee_in_usd = pricesJSON.minimal_fee_in_usd;
    const addResponse = await contract.add_moto(parameters, "300000000000000", minimal_fee_in_usd);
    return JSON.stringify(addResponse);
}

async function nearAddTrack(mainnet, motoDexContract, tokenId) {
    console.log("nearAddTrack motoDexContract " + motoDexContract + "; NFT tokenId " + tokenId);
    mainnet = await checkNetwork(mainnet);

    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        motoDexContract,// name of contract you're connecting to
        {
            changeMethods: ["add_track"],
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    // const amountString = eToNumber(amountInt);
    let parameters = {token_id:tokenId};
    const prices = await nearMinimalFeeInUSD(mainnet, motoDexContract);
    const pricesJSON = JSON.parse(prices);
    const minimal_fee_in_usd = pricesJSON.minimal_fee_in_usd;
    const addResponse = await contract.add_moto(parameters, "300000000000000", minimal_fee_in_usd);
    return JSON.stringify(addResponse);
}

async function listNearNFTsWeb(mainnet, contractAddress, selectedAccount) {
	  console.log("listNearNFTsWeb network " + mainnet + "; motoDexContract " + contractAddress + "; selectedAccount " + selectedAccount);
    mainnet = await checkNetwork(mainnet);
    
    let wallet = await connectNearWallet(mainnet)
    const contract = new nearApi.Contract(
        wallet.account(), // the account object that is connecting
        contractAddress,// name of contract you're connecting to
        {
            viewMethods: ["nft_tokens_for_owner"], // view methods do not change state but usually return a value
            sender: wallet.account(), // account object to initialize and sign transactions.
        }
    );
    // console.log("listNearNFTsWeb contract " + contract);

    const nft_tokens_for_owner = await contract.nft_tokens_for_owner({ account_id: selectedAccount });
    window.web3gl.listNearNFTsWebResponse = JSON.stringify(nft_tokens_for_owner);
    return JSON.stringify(nft_tokens_for_owner);
}

async function nearSendContract(mainnet, motoDexContract, method, args, value) {
    args = JSON.parse(args);
    console.log(args);
    console.log(args[0]);
  	let response;
    mainnet = await checkNetwork(mainnet);
    switch (method) {
            case "purchase" :
                response = await nearBuyNFTFor(mainnet, motoDexContract, parseInt(args[0]), args[1]);
                break;
            case "addMoto" :
                response = await nearAddMoto(mainnet, motoDexContract,  JSON.stringify(args));
                break;
            case "addTrack" :
                response = await nearAddTrack(mainnet, motoDexContract, JSON.stringify(args));
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
	let response;
  mainnet = await checkNetwork(mainnet);
    switch (method) {
            case "methodName" :
                // call function
                break;
            case "methodName2" :
                // call function
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

// View methods
// tokenURI : tokenId (uint256)
// valueInMainCoin : valueInUSD (uint256)
// getHealthForId : tokenId (uint256)
// getPriceForType : typeNft (uint8)
// getPercentForTrack : tokenId (uint256)
// balanceOf : owner (address)
// minimalFeeInUSD : "[]"
// latestEpochUpdate : "[]"
// tokenIdsAndOwners : "[]"
// getGameSessions : "[]"
// getAllGameBids : "[]"
// getLatestPrice : "[]"
// syncEpochResultsBidsFinal : "[]"
// syncEpochResultsMotosFinal : "[]"
// getLimitsAndCounters : "[]"

// Change methods
// returnMoto : ""; tokenId (uint256)
// returnTrack : ""; tokenId (uint256)
// addHealthNFT : ""; tokenId (uint256), healthPillTokenId (uint256)
// bidFor : bidFor; trackTokenId (uint8), motoTokenId (uint8)
// addMoto : addMoto; tokenId (uint256)
// addTrack : addTrack; tokenId (uint256)
// addHealthMoney : addHealthMoney; tokenId (uint256)