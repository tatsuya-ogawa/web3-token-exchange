import {ExchangeableToken} from "../../hardhat/typechain-types";
import ExchangeableTokenSol from '../../hardhat/artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
import {Node, Node1, Node2} from "../../config";
import {ethers, ContractFactory, BigNumber} from "ethers";

export class NodeManager {
    private wallet: ethers.Wallet;
    public addressOfContract?: string;
    private chainId: number;

    getChainId(): string {
        return "0x" + this.chainId.toString(16);
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

    async deploy(): Promise<string> {
        const factory = new ContractFactory(ExchangeableTokenSol.abi, ExchangeableTokenSol.bytecode);
        const contract = await factory.connect(this.wallet).deploy({});
        this.addressOfContract = contract.address;
        return this.addressOfContract;
    }
    async faucetToContract(){
        if(!this.addressOfContract)return
        console.log(`faucet to ${this.addressOfContract}`);
        const tx = {
            to: this.addressOfContract!,
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther("1")
        }
        await this.wallet.sendTransaction(tx);
        const balance = await this.wallet.provider.getBalance(this.addressOfContract);
        console.log(`balance of ${this.addressOfContract} is ${balance}`);
    }
}

export class ExchangeManager {
    public node1: NodeManager;
    public node2: NodeManager;

    constructor() {
        this.node1 = new NodeManager(Node1);
        this.node2 = new NodeManager(Node2);
    }

    async deploy() {
        const contract1Address = await this.node1.deploy();
        console.log(`node1 deployed , address of contract is ${contract1Address}`)
        const contract2Address = await this.node2.deploy();
        console.log(`node2 deployed , address of contract is ${contract2Address}`)
    }

    async start() {
        this.node1.watch(async (from, to, amount) => {
            try {
                console.log(`transfer node1:${from} to node2:${to} ${amount}`)
                await this.node2.deposit(to, amount);
            } catch (ex) {
                console.log(ex);
            }
        })
        this.node2.watch(async (from, to, amount) => {
            try {
                console.log(`transfer node2:${from} to node1:${to} ${amount}`)
                await this.node1.deposit(to, amount);
            } catch (ex) {
                console.log(ex);
            }
        })
        while(true){
            try {
                await this.node1.faucetToContract();
                await this.node2.faucetToContract();
            }catch (ex){
                console.log(ex);
            }
            await new Promise((resolve,reject)=>{setTimeout(resolve,600000)});
        }
    }
}