import { HardhatUserConfig } from "hardhat/config";
import Config,{Node} from "../config";
const node:Node = Config[process.env.NODE as string];
const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      accounts: [{
        privateKey: node.accounts.conbase.privateKey,//"26e2e186e201a30f6f03fe03f23f4ced8f8054911478343e72bf52a35c2ff121",
        balance: "500000000000000000000"
      }],
      coinbase: node.accounts.conbase.address,//"0xf88bee0ac4fc75c7059c83358711e86d5c652317",
      chainId: node.customChain.chainId,//12345
      mining: {
        auto: true,
        // interval: [1000, 2000]
      }
    },
  }
};

export default config;
