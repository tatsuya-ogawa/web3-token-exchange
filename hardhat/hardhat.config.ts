import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import AppConfig from "../config"
const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    localmain: {
      url: "http://localhost:8545",
      accounts: [AppConfig.accounts.deployer.privateKey],
      chainId: AppConfig.customChain.chainId,
      gas: 8000000
    },
    // localsub:{
    //   url: "http://localhost:18545",
    //   accounts:[],
    // }
  }
};

export default config;
