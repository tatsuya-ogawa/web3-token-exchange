import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { Node1, Node2 } from "../config"
const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {    
    localmain: {
      url: Node1.endpoint,
      accounts: [Node1.accounts.deployer.privateKey],
      chainId: Node1.customChain.chainId,
      gas: 8000000
    },
    localsub: {
      url: Node2.endpoint,
      accounts: [Node2.accounts.deployer.privateKey],
      chainId: Node2.customChain.chainId,
      gas: 8000000
    }
  }
};

export default config;
