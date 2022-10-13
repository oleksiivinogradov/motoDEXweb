document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://cdn.jsdelivr.net/npm/near-api-js@1.1.0/dist/near-api-js.js" }));

document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/borsh.bundle.js" }));


window contractAccount = 'dev-1665539763891-92130190657353';



window MOTODEX_CONTRACT = 'dev-1665539775143-48180424943370';
window NFT_CONTRACT = 'dev-1665539763891-92130190657353';
window accountId = 'dev-1665539712757-38727336993669';
window accountPk = 'dGd8cS2v5PYJKN3icBuLkz4RKhKjnKPma5wjs1QR58UY7vWpuNcKJjGdgmvbw9HbkyRuMfAdsunMBargt1dg7DQ';


// Create key pair
const keyPair = nearApi.KeyPair.fromString(accountPk);

const nearconfig = {
        nodeUrl: 'https://rpc.testnet.near.org',
        archiveNodeUrl: 'https://archival-rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        networkId: 'testnet',
        contractName: contractAccount,
};

class API {
        constructor(nearConfig) {
            this.nearConfig = nearConfig;
            this.near = new nearApi.Near(nearConfig);

            this.wallet = new nearApi.connect({
                keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
                ...nearConfig,
            });
        }

        async getWalletConnection() {
            const keyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore();
            await keyStore.setKey(nearconfig.networkId, accountId, keyPair);

            this.nearConfig.keyStore = keyStore;
            const wc = new nearApi.WalletConnection(new nearApi.Near(this.nearConfig), null);

            return wc;
        }

        async actionsToTransaction(receiverId, actions) {
            return await this.createTx(
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

        async createTx(
            receiverId,
            actions,
            nonceOffset = 1
        ) {
            let wallet = await this.getWalletConnection();
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

        async executeMultipleTransactions(transactions, meta = "") {
            const wallet = await this.getWalletConnection();
            return wallet.requestSignTransactions({ transactions, meta });
        }

        async twoTransactionsSample() {
            const transactions = [];

            // Create transfer transaction
            // "receiver_id": "'$MOTODEX_CONTRACT'", "token_id": "1", "msg": "{\"action\":{\"type\":\"AddTrack\"}}"
            const transferAction = {
                args: {
                    receiver_id: MOTODEX_CONTRACT, // NFT CONTRACT
                    token_id: "1",
                    msg: JSON.stringify({ action: { type: "AddTrack" } }),
                },
                gas: '50000000000000',
                deposit: "1",
                methodName: "nft_transfer_call",
            };
            const transferTransaction = await this.actionsToTransaction(
                NFT_CONTRACT,
                [transferAction]
            );

            transactions.push(transferTransaction);

            const addTrackAction = {
                args: {
                    token_id: "1",
                },
                gas: '50000000000000',
                deposit: nearApi.utils.format.parseNearAmount("0.1"),
                methodName: "add_track",
            };
            const addTrackTransaction = await this.actionsToTransaction(
                MOTODEX_CONTRACT,
                [addTrackAction]
            );

            transactions.push(addTrackTransaction);

            // Execute transactions
            return await this.executeMultipleTransactions(transactions);
        }
    }