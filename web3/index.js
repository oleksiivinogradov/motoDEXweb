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
  addMoney,
  addMoneyResponse: ""
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
                    rpcUrls: ['https://testnet.aurora.dev'],
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
            default:
                alert('Network not supported to adding!');

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

async function addMoney(currency){
    window.web3gl.addMoneyResponse = "https://buy.ramp.network?userAddress=$"+widget.entitie.walletAddress+"&swapAsset=$"+currency+"&fiatCurrency=USD&fiatValue=$"+double.parse(widget.args.controller.text)+"&hostApiKey=3drqkj4knryjjaf379e2xzpohxmqmr3h64tt5bsk&hostAppName=OpenBiSea&hostLogoUrl=https://res2.weblium.site/res/606b20dca1c3e80021e6a82c/60780ff9e61afe0021f8af90_optimized_927";
    // String _generateURL(String currency) =>
      // "https://buy.ramp.network?userAddress=${widget.entitie.walletAddress}&swapAsset=$currency&fiatCurrency=USD&fiatValue=${double.parse(widget.args.controller.text)}&hostApiKey=3drqkj4knryjjaf379e2xzpohxmqmr3h64tt5bsk&hostAppName=OpenBiSea&hostLogoUrl=https://res2.weblium.site/res/606b20dca1c3e80021e6a82c/60780ff9e61afe0021f8af90_optimized_927";
}