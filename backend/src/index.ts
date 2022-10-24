import express from 'express'
import Nodes, {Node, Node1, Node2, NodeList} from "../../config";
import {ethers} from "ethers";
import morgan from "morgan";
import {ExchangeManager} from "./contract";
import ExchangeableTokenSol from '../../hardhat/artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
const contractAddresses = {} as { [key: string]: string }
(async () => {
    const exchangeManager = new ExchangeManager();
    await exchangeManager.deploy();
    contractAddresses[exchangeManager.node1.getChainId()] = exchangeManager.node1.addressOfContract!;
    contractAddresses[exchangeManager.node2.getChainId()] = exchangeManager.node2.addressOfContract!;
    await exchangeManager.start();
})();

const app: express.Express = express()
app.use(morgan("combined"));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*")
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

app.listen(4000, () => {
    console.log("Start on port 4000.")
})

app.post('/faucet', async (req: express.Request, res: express.Response) => {
    const getNode = (chainId: string): Node | undefined => {
        return NodeList.find((node) => {
            return "0x" + node.customChain.chainId.toString(16) == chainId;
        })
    }
    const chainId = req.body.chainId;
    const toAddress = req.body.address;
    const node: Node | undefined = getNode(chainId);
    if (!node) {
        res.status(404).send(JSON.stringify({}))
        return;
    }
    const endpoint = node.endpoint;
    const privateKey = node.accounts.coinbase.privateKey;
    const provider = new ethers.providers.JsonRpcProvider(endpoint, {
        name: node.customChain.name,
        chainId: node.customChain.chainId
    });
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = {
        to: toAddress,
        // Convert currency unit from ether to wei
        value: ethers.utils.parseEther("1")
    }
    await wallet.sendTransaction(tx);
    res.send(JSON.stringify({}))
})
app.get('/contract/:chainId', async (req: express.Request, res: express.Response) => {
    const chainId = req.params.chainId;
    const address = contractAddresses[chainId];
    const abi = ExchangeableTokenSol.abi
    res.send(JSON.stringify({address,abi}));
})
app.get('/networks', async (req: express.Request, res: express.Response) => {
    const createResponse = (node: Node, index: number) => {
        return {
            chainId: '0x' + node.customChain.chainId.toString(16),
            chainName: node.customChain.name,
            nativeCurrency: {
                name: `exchange${index+1}`,
                symbol: `EX${index+1}`,
                decimals: 10 //In number form
            },
            rpcUrls: [node.endpoint],
            // blockExplorerUrls?: ["BLOCKCHAIN_EXPLORER"]
        }
    }
    res.send(JSON.stringify(NodeList.map(createResponse)));
});