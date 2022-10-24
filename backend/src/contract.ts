import {ExchangeableToken} from "../../hardhat/typechain-types";
import ExchangeableTokenSol from '../../hardhat/artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
import {Node, Node1, Node2} from "../../config";
import {ethers, ContractFactory, BigNumber} from "ethers";

class NodeManager {
    private wallet: ethers.Wallet;
    public addressOfContract?: string;
    private chainId:number;
    getChainId():string{
        return "0x"+this.chainId.toString(16);
    }
    constructor(node: Node) {
        const endpoint = node.endpoint;
        const privateKey = node.accounts.coinbase.privateKey;
        const provider = new ethers.providers.JsonRpcProvider(endpoint, {
            name: node.customChain.name,
            chainId: node.customChain.chainId
        });
        this.wallet = new ethers.Wallet(privateKey, provider);
        this.chainId = node.customChain.chainId;
    }

    watch(callback: (from: string, to: string, amount: BigNumber) => Promise<void>) {
        const exchangeableTokenContract: ExchangeableToken = new ethers.Contract(this.addressOfContract!, ExchangeableTokenSol.abi, this.wallet) as any;
        const filter = exchangeableTokenContract.filters.ExchangeTransfer(null, null, null)
        exchangeableTokenContract.on(filter, async (from, to, amount) => {
            await callback(from, to, amount);
        })
    }

    async deposit(to: string, amount: BigNumber) {
        const exchangeableTokenContract: ExchangeableToken = new ethers.Contract(this.addressOfContract!, ExchangeableTokenSol.abi, this.wallet) as any;
        await exchangeableTokenContract.deposit(to, amount);
    }

    // async exchange(to: string, amount:BigNumber){
    //     const exchangeableTokenContract: ExchangeableToken = new ethers.Contract(this.addressOfContract!, ExchangeableTokenSol.abi, this.wallet) as any;
    //     const filter = exchangeableTokenContract.filters.ExchangeTransfer(null, null, null)
    //     exchangeableTokenContract.on(filter, async (from, to, amount) => {
    //         console.log({from,to,amount});
    //     })
    //     await exchangeableTokenContract.exchange(to, amount,{value:amount});
    // }

    async deploy():Promise<string>{
        const factory = new ContractFactory(ExchangeableTokenSol.abi, ExchangeableTokenSol.bytecode);
        const contract = await factory.connect(this.wallet).deploy({});
        this.addressOfContract = contract.address;
        return this.addressOfContract;
    }
}
export class ExchangeManager{
    public node1:NodeManager;
    public node2:NodeManager;

    constructor() {
        this.node1 = new NodeManager(Node1);
        this.node2 = new NodeManager(Node2);
    }
    async deploy(){
        const contract1Address = await this.node1.deploy();
        console.log(`node1 deployed , address of contract is ${contract1Address}`)
        const contract2Address = await this.node2.deploy();
        console.log(`node2 deployed , address of contract is ${contract2Address}`)
    }
    async start(){
        this.node1.watch(async(from,to,amount)=>{
            console.log(`transfer node1:${from} to node2:${to} ${amount}`)
            await this.node2.deposit(to,amount);
        })
        this.node2.watch(async(from,to,amount)=>{
            console.log(`transfer node2:${from} to node1:${to} ${amount}`)
            await this.node1.deposit(to,amount);
        })
    }
}