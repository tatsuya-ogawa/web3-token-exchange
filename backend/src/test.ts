import {ExchangeManager} from "./contract";
import {BigNumber} from "ethers";

(async () => {
    const exchangeManager = new ExchangeManager();
    await exchangeManager.deploy();
    exchangeManager.node1.addressOfContract = "0x8ffC7C015c4dF655d2F8A857E24D3b42341bCCA4"
    exchangeManager.node2.addressOfContract = "0x9eB4cdF69d662e8e56beb8cFE2abF335372F8316"
    exchangeManager.node1.watch(async(from,to,amount)=>{
        console.log({from,to,amount});
    })
    // await exchangeManager.node1.exchange("0x90A48A5fC6501EFa3Cd7E692b07Fb7206D06cb04", BigNumber.from(100));
})()
