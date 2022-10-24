import { ExchangeableToken } from "../hardhat/typechain-types";
import ExchangeableTokenSol from '../hardhat/artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
import { Node1 } from "../config";
import { ethers,ContractFactory } from "ethers";

const endpoint = Node1.endpoint;
const privateKey = Node1.accounts.deployer.privateKey;
const addressOfContract = "0x93dFC04B73bB8f218d1a144550a0F6BF4865A9EE";
const provider = new ethers.providers.JsonRpcProvider(endpoint,{
    name: Node1.customChain.name,
    chainId:Node1.customChain.chainId
});
const wallet = new ethers.Wallet(privateKey, provider);
const deploy = async()=>{
    const factory = new ContractFactory(ExchangeableTokenSol.abi, ExchangeableTokenSol.bytecode);    
    const contract = await factory.connect(wallet).deploy({});
    console.log(contract.address);
}
const main = async () => {

    console.log(await provider.getBalance(addressOfContract));

    const exchangeableTokenContract: ExchangeableToken = new ethers.Contract(addressOfContract, ExchangeableTokenSol.abi, wallet) as any;
    const filter = exchangeableTokenContract.filters.ExchangeTransfer(wallet.address,null,null)
    exchangeableTokenContract.on(filter, (from, to, amount) => {
        console.log(`send to:  ${to} ${amount}`)
    })    
    await exchangeableTokenContract.mint(100,{value:1000});
    const balance = await exchangeableTokenContract.balanceOf(wallet.address);
    console.log(balance);
    await exchangeableTokenContract.exchange(wallet.address,100);
}
deploy();