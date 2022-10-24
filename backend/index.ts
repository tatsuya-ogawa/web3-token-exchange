import express from 'express'

import Nodes, { Node } from "../config";
import { ethers } from "ethers";
import { request } from 'http';

const app: express.Express = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*")
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

app.listen(4000, () => {
    console.log("Start on port 4000.")
})

app.post('/faucet', async(req: express.Request, res: express.Response) => {
    const nodeName = req.body.node;
    const toAddress = req.body.address;
    const node: Node = Nodes.Node1;// (Nodes as any)[nodeName];
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