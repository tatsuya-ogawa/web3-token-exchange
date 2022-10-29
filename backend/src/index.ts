import express from 'express'
import Nodes, {Node, Node1, Node2, NodeList} from "../../config";
import {BigNumber, ethers} from "ethers";
import morgan from "morgan";
import {ExchangeManager, NodeManager} from "./daemon";
import cors from 'cors';
import ExchangeableTokenSol from '../../hardhat/artifacts/contracts/ExchangeableToken.sol/ExchangeableToken.json'
const nodeManagers = {} as { [key: string]: NodeManager }
(async () => {
    const exchangeManager = new ExchangeManager();
    await exchangeManager.deploy();
    nodeManagers[exchangeManager.node1.getChainId()] = exchangeManager.node1;
    nodeManagers[exchangeManager.node2.getChainId()] = exchangeManager.node2;
    await exchangeManager.start();
})();

const app: express.Express = express()
app.use(cors())
app.options('*', cors())
app.use(morgan("combined"));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

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
    const nodeManager: NodeManager | undefined = nodeManagers[chainId];
    if (!nodeManager) {
        res.status(404).send(JSON.stringify({}))
        return;
    }
    await nodeManager.faucet(toAddress);
    res.send(JSON.stringify({}))
})
app.post('/withdraw', async (req: express.Request, res: express.Response) => {
    const signature = req.body.signature
    const digest = ethers.utils.hashMessage(req.body.message)
    const recoverAddress = ethers.utils.recoverAddress(digest, signature)
    const {chainId,amount,address} = JSON.parse(req.body.message);
    if(recoverAddress !== address){
        console.log(`signed address not matched ${address},${recoverAddress}`)
        res.status(404).send(JSON.stringify({}))
        return;
    }
    const nodeManager: NodeManager | undefined = nodeManagers[chainId];
    if (!nodeManager) {
        console.log(`chain not found ${chainId}`)
        res.status(404).send(JSON.stringify({}))
        return;
    }
    await nodeManager.withdraw(address,BigNumber.from(amount));
    res.send(JSON.stringify({}))
})
app.get('/contract/:chainId', async (req: express.Request, res: express.Response) => {
    const chainId = req.params.chainId;
    const address = nodeManagers[chainId].addressOfContract;
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
                decimals: 18 //In number form
            },
            rpcUrls: [node.frontEndpoint],
            // blockExplorerUrls?: ["BLOCKCHAIN_EXPLORER"]
        }
    }
    res.send(JSON.stringify(NodeList.map(createResponse)));
});