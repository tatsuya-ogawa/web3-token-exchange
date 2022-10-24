import { ExchangeableToken } from "../../hardhat/typechain-types";
// import ExchangeableTokenSol from './artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
import { ethers, ContractFactory} from "ethers";
export interface ExchangeNetwork {
    chainId: string,
    chainName: string,
    nativeCurrency: { name: string, symbol: string, decimals: number },
    rpcUrls: string[]
}
export class ExchangeService {
    constructor() {
        //name: string, endpoint: string, chainId: number
        // const provider = new ethers.providers.JsonRpcProvider(endpoint, {
        //     name: name,
        //     chainId: chainId
        // });
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