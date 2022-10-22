import { Miner } from 'web3-eth-miner';
import { Common } from '@ethereumjs/common'
import { Transaction, TxData, TxOptions } from '@ethereumjs/tx';
import Web3 from 'web3';
import Wallet from 'ethereumjs-wallet';
import AppConfig from '../config';
import request from 'request'
const web3 = new Web3();

web3.eth.defaultCommon = {
    customChain: AppConfig.customChain,
}
const endpoint = 'http://localhost:8545';
const provider = new Web3.providers.HttpProvider(endpoint);
web3.setProvider(provider);
const miner = new Miner(provider as any);
const getWallet = (privateKey: string): Wallet => {
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    return wallet;
}
const startMining = async (endpoint: string) => {
    return new Promise((resolve, reject) => {
        request.post(endpoint, {
            headers: {
                "Content-Type": "application/json"
            },
            json: { "jsonrpc": "2.0", "id": 0, "method": "miner_start", "params": [4] },
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

const createTransaction = async () => {
    const coinbaseAccount = web3.eth.accounts.privateKeyToAccount("0x" + AppConfig.accounts.conbase.privateKey);
    const deployerAccount = web3.eth.accounts.privateKeyToAccount("0x" + AppConfig.accounts.deployer.privateKey);
    const coinbaseBalance = Number.parseInt(await web3.eth.getBalance(coinbaseAccount.address));
    const deployerBalance = Number.parseInt(await web3.eth.getBalance(deployerAccount.address));
    console.log({
        coinbaseBalance,
        deployerBalance
    });
    const sendBalance = 1000000000000000000;
    if (coinbaseBalance == 1000000000000000000) return;

    const fromWallet = getWallet(AppConfig.accounts.conbase.privateKey);
    const toWallet = getWallet(AppConfig.accounts.deployer.privateKey);
    const count = await web3.eth.getTransactionCount(fromWallet.getAddressString());
    const countHex = `0x${count}`;
    const gasLimit = 100000;
    const txParams = {
        nonce: countHex,
        gasPrice: '0x09184e72a000',
        gasLimit: '0x' + gasLimit.toString(16),
        to: toWallet.getAddressString(),
        value: '0x' + sendBalance.toString(16),
        chainId: AppConfig.customChain.chainId,
    } as TxData;
    let txOptions: TxOptions = {
        common: Common.custom({ chainId: AppConfig.customChain.chainId, networkId: AppConfig.customChain.networkId })
    }
    let tx = new Transaction(txParams, txOptions)
    tx = tx.sign(fromWallet.getPrivateKey())
    const serializedTx = tx.serialize();
    const rawTx = '0x' + serializedTx.toString('hex');
    await web3.eth.sendSignedTransaction(rawTx);
}
const loop = async() => {
    while(true){
        await createTransaction()
        await new Promise((resolve,reject)=>setTimeout(resolve,1000))
    }
}
const main = async () => {
    const coinbaseAccount = web3.eth.accounts.privateKeyToAccount("0x" + AppConfig.accounts.conbase.privateKey);
    console.log(await web3.eth.getCoinbase())
    await miner.setEtherbase(coinbaseAccount.address);
    console.log(await web3.eth.getCoinbase())
    await startMining(endpoint);
    // for(var account of await web3.eth.getAccounts()){
    //     console.log(account)
    // }
    await loop();
}
main();