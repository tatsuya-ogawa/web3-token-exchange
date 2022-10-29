import { ExchangeableToken } from "../../hardhat/typechain-types";
// import ExchangeableTokenSol from './artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
import { ethers} from "ethers";
export interface ExchangeNetwork {
    chainId: string,
    chainName: string,
    nativeCurrency: { name: string, symbol: string, decimals: number },
    rpcUrls: string[]
}
export class ExchangeService {
    constructor() {
    }
    async getContract(chainId:string,signer:ethers.Signer):Promise<ExchangeableToken>{
        const response =await fetch(`http://localhost:4000/contract/${chainId}`);
        const json = await response.json();
        const exchangeableTokenContract: ExchangeableToken = new ethers.Contract(json.address, json.abi, signer) as any;
        return exchangeableTokenContract;
    }
    async getNetworks():Promise<ExchangeNetwork[]>{
        const response =await fetch("http://localhost:4000/networks");
        const networks: ExchangeNetwork[] = await response.json();
        return networks;
    }
    async withdraw(amount:string,chainId:string,signer:ethers.Signer){
        const message = JSON.stringify({
            amount:amount,
            address: await signer.getAddress(),
            chainId: chainId,
            now: new Date().getTime(),
            salt: Math.random().toString(32).substring(2)
        });
        const signature = await signer.signMessage(message);
        await fetch("http://localhost:4000/withdraw", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message,signature})
        })
    }
    async faucet(address:string,chainId:string){
        await fetch("http://localhost:4000/faucet", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: address,
                chainId: chainId
            })
        })
    }
}