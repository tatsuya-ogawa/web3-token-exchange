import { HardhatUserConfig } from "hardhat/config";
import Config,{Node} from "../config";
const node:Node = Config[process.env.NODE as string];
const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      accounts: [{
        privateKey: node.accounts.coinbase.privateKey,
        balance: "500000000000000000000"
      }],
      coinbase: node.accounts.coinbase.address,
      chainId: node.customChain.chainId,
      mining: {
        auto: true,
        // interval: [1000, 2000]
      }
    },
  }
};

export default config;
