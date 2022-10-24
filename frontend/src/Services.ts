import { ExchangeableToken } from "../../hardhat/typechain-types";
import ExchangeableTokenSol from '../../hardhat/artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
import { ethers, ContractFactory} from "ethers";
export class ExchangeService {
    constructor(name: string, endpoint: string, chainId: number) {
        const provider = new ethers.providers.JsonRpcProvider(endpoint, {
            name: name,
            chainId: chainId
        });
    }
    getContract(address:string,signer:ethers.Signer){
        const exchangeableTokenContract: ExchangeableToken = new ethers.Contract(address, ExchangeableTokenSol.abi, signer) as any;
    }
}