import { Miner } from 'web3-eth-miner';
import { Common } from '@ethereumjs/common'
import { Transaction, TxData, TxOptions } from '@ethereumjs/tx';
import Web3 from 'web3';
import Wallet from 'ethereumjs-wallet';
import { Node, Node1, Node2 } from '../config';
import request from 'request'
const getWallet = (privateKey: string): Wallet => {
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    return wallet;
}
class NodeManager {
    private web3 = new Web3();
    private appConfig: Node;
    private endpoint;
    private provider;
    private miner;
    constructor(node: Node) {
        this.appConfig = node;
        this.endpoint = this.appConfig.endpoint;
        this.provider = new Web3.providers.HttpProvider(this.endpoint);
        this.miner = new Miner(this.provider as any)
        this.web3.eth.defaultCommon = {
            customChain: this.appConfig.customChain,
        }
        this.web3.setProvider(this.provider);
    }
    log(msg:any){
        console.log(`${this.appConfig.name} : ${JSON.stringify(msg)}`);
    }
    logError(msg:any){
        console.error(msg);
    }

    async startMining(endpoint: string) {
        return new Promise((resolve, reject) => {
            request.post(endpoint, {
                headers: {
                    "Content-Type": "application/json"
                },
                json: { "jsonrpc": "2.0", "id": 0, "method": "miner_start", "params": [1] },
                callback: (error, response, body) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(body);
                    }
                }
            })
        })
    }

    async createTransaction() {
        const web3 = this.web3;
        const appConfig = this.appConfig;
        const coinbaseAccount = web3.eth.accounts.privateKeyToAccount("0x" + appConfig.accounts.coinbase.privateKey);
        const deployerAccount = web3.eth.accounts.privateKeyToAccount("0x" + appConfig.accounts.deployer.privateKey);
        const coinbaseBalance = Number.parseInt(await web3.eth.getBalance(coinbaseAccount.address));
        const deployerBalance = Number.parseInt(await web3.eth.getBalance(deployerAccount.address));
        this.log({
            coinbaseBalance,
            deployerBalance
        });
        const sendBalance = 1000000000000000000;
        if (coinbaseBalance == 1000000000000000000) return;

        const fromWallet = getWallet(appConfig.accounts.coinbase.privateKey);
        const toWallet = getWallet(appConfig.accounts.deployer.privateKey);
        const count = await web3.eth.getTransactionCount(fromWallet.getAddressString());
        const countHex = `0x${count.toString(16)}`;
        const gasLimit = 100000;
        const txParams = {
            nonce: countHex,
            gasPrice: '0x09184e72a000',
            gasLimit: '0x' + gasLimit.toString(16),
            to: toWallet.getAddressString(),
            value: '0x' + sendBalance.toString(16),
            chainId: appConfig.customChain.chainId,
        } as TxData;
        let txOptions: TxOptions = {
            common: Common.custom({ chainId: appConfig.customChain.chainId, networkId: appConfig.customChain.networkId })
        }
        let tx = new Transaction(txParams, txOptions)
        tx = tx.sign(fromWallet.getPrivateKey())
        const serializedTx = tx.serialize();
        const rawTx = '0x' + serializedTx.toString('hex');
        await web3.eth.sendSignedTransaction(rawTx);
    }
    async loop() {
        while (true) {
            try{
                await this.createTransaction()
            }catch(ex){
                this.logError(ex);
            }
            await new Promise((resolve, reject) => setTimeout(resolve, 1000))
        }
    }
    async start() {
        const web3 = this.web3;
        const appConfig = this.appConfig;
        const coinbaseAccount = web3.eth.accounts.privateKeyToAccount("0x" + appConfig.accounts.coinbase.privateKey);
        let currentCoinbaseAddress = await web3.eth.getCoinbase();
        if(currentCoinbaseAddress != coinbaseAccount.address.toLowerCase()){
            await this.miner.setEtherbase(coinbaseAccount.address);
            currentCoinbaseAddress = await web3.eth.getCoinbase();
        }
        this.log(`coinbase address is ${currentCoinbaseAddress}`)
        const deployerAccount = web3.eth.accounts.privateKeyToAccount("0x" + appConfig.accounts.deployer.privateKey);
        this.log(`deployer address is ${deployerAccount.address}`)

        await this.startMining(this.endpoint);
        // for(var account of await web3.eth.getAccounts()){
        //     this.log(account)
        // }
        await this.loop();
    }
}
const node1 = new NodeManager(Node1);
node1.start();
const node2 = new NodeManager(Node2);
node2.start();